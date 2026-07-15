import { NgFor, NgIf } from '@angular/common';
import { Component, ElementRef, HostListener, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

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
export class AdminSelectComponent implements ControlValueAccessor {
  @Input() options: AdminSelectOption[] = [];

  value = '';
  isOpen = false;
  disabled = false;

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(private elementRef: ElementRef<HTMLElement>) {}

  get selectedLabel(): string {
    const match = this.options.find((option) => option.value === this.value);
    return match ? match.label : (this.options[0]?.label ?? '');
  }

  toggle(event?: Event): void {
    event?.stopPropagation();
    if (this.disabled) {
      return;
    }
    this.isOpen = !this.isOpen;
    if (!this.isOpen) {
      this.onTouched();
    }
  }

  select(option: AdminSelectOption, event?: Event): void {
    event?.stopPropagation();
    this.value = option.value;
    this.isOpen = false;
    this.onChange(this.value);
    this.onTouched();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.isOpen && !this.elementRef.nativeElement.contains(event.target as Node)) {
      this.isOpen = false;
      this.onTouched();
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
