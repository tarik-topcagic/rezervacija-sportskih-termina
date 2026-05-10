import { Component, ElementRef, EventEmitter, HostListener, Output } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { CHAT_EMOJI_OPTIONS } from '../helpers/chat-input.helper';
import { TranslatePipe } from '../pipes/translate.pipe';

@Component({
  selector: 'app-chat-emoji-picker',
  imports: [NgIf, NgFor, TranslatePipe],
  templateUrl: './chat-emoji-picker.component.html',
  styleUrl: './chat-emoji-picker.component.scss',
})
export class ChatEmojiPickerComponent {
  @Output() emojiSelected = new EventEmitter<string>();

  readonly emojis = CHAT_EMOJI_OPTIONS;
  isOpen = false;

  constructor(private elementRef: ElementRef<HTMLElement>) {}

  togglePicker(event?: Event): void {
    event?.stopPropagation();
    this.isOpen = !this.isOpen;
  }

  selectEmoji(emoji: string, event?: Event): void {
    event?.stopPropagation();
    this.emojiSelected.emit(emoji);
    this.isOpen = false;
  }

  @HostListener('document:click', ['$event'])
  closeOnOutsideClick(event: Event): void {
    const target = event.target as Node | null;

    if (!target || this.elementRef.nativeElement.contains(target)) {
      return;
    }

    this.isOpen = false;
  }
}
