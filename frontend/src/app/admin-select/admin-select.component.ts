import { NgFor, NgIf } from '@angular/common';
import { Component, ElementRef, HostListener, Input, OnDestroy, OnInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { AdminSelectCoordinatorService } from '../../services/admin/admin-select-coordinator.service';

export interface AdminSelectOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-admin-select',
  standalone: true,
  imports: [NgFor, NgIf],
  templateUrl: './admin-select.component.html',
  styleUrl: './admin-select.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: AdminSelectComponent,
      multi: true,
    },
  ],
})
export class AdminSelectComponent implements ControlValueAccessor, OnInit, OnDestroy {
  @Input() options: AdminSelectOption[] = [];

  value = '';
  isOpen = false;
  disabled = false;

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};
  private readonly onOtherDropdownOpened = () => this.forceClose();

  constructor(
    private elementRef: ElementRef<HTMLElement>,
    private coordinator: AdminSelectCoordinatorService,
  ) {}

  ngOnInit(): void {
    window.addEventListener('app-message-dropdown-opened', this.onOtherDropdownOpened);
    window.addEventListener('app-notification-dropdown-opened', this.onOtherDropdownOpened);
  }

  ngOnDestroy(): void {
    window.removeEventListener('app-message-dropdown-opened', this.onOtherDropdownOpened);
    window.removeEventListener('app-notification-dropdown-opened', this.onOtherDropdownOpened);
  }

  get selectedLabel(): string {
    const match = this.options.find((option) => option.value === this.value);
    return match ? match.label : (this.options[0]?.label ?? '');
  }

  toggle(event?: Event): void {
    // Deliberately not stopping propagation: letting the click reach `document` lets
    // native Bootstrap dropdowns (e.g. the navbar profile menu) detect it as an outside
    // click and close themselves. This component's own onDocumentClick already ignores
    // clicks on its own trigger via the contains() check below, so this is safe.
    if (this.disabled) {
      return;
    }
    if (this.isOpen) {
      this.close();
    } else {
      this.coordinator.opened(this);
      this.isOpen = true;
      window.dispatchEvent(new CustomEvent('app-admin-select-opened'));
    }
  }

  select(option: AdminSelectOption, event?: Event): void {
    this.value = option.value;
    this.onChange(this.value);
    this.close();
  }

  forceClose(): void {
    this.isOpen = false;
    this.onTouched();
  }

  private close(): void {
    this.isOpen = false;
    this.coordinator.closed(this);
    this.onTouched();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.isOpen && !this.elementRef.nativeElement.contains(event.target as Node)) {
      this.close();
    }
  }

  writeValue(value: string): void {
    this.value = value ?? '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
