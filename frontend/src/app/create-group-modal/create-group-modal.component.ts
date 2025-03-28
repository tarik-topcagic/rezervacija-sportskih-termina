import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { GroupService } from '../../services/group.service';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-create-group-modal',
  imports: [NgIf, ReactiveFormsModule],
  templateUrl: './create-group-modal.component.html',
  styleUrl: './create-group-modal.component.scss'
})
export class CreateGroupModalComponent {
  @Output() close = new EventEmitter<void>();
  @Output() groupCreated = new EventEmitter<any>();

  createGroupForm: FormGroup;
  selectedImage: File | null = null;
  previewUrl: string | null = null;
  isSubmitting: boolean = false;
  errorMessage: string = '';

  constructor(private groupService: GroupService, private fb: FormBuilder) {
    this.createGroupForm = this.fb.group({
      name: ['', Validators.required],
      description: ['']
    });
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      this.selectedImage = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result as string;
        this.createGroupForm.markAsDirty();
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(): void {
    this.selectedImage = null;
    this.previewUrl = null;
    this.createGroupForm.markAsDirty();
  }

  submitGroup(): void {
    if (this.createGroupForm.invalid) {
      return;
    }
    this.isSubmitting = true;
    this.errorMessage = '';

    const data = {
      Name: this.createGroupForm.value.name,
      Description: this.createGroupForm.value.description,
      ImageUrl: this.previewUrl || ""
    };

    this.groupService.createGroup(data).subscribe(
      (response) => {
        this.isSubmitting = false;
        this.groupCreated.emit(response);
      },
      (error) => {
        this.isSubmitting = false;
        this.errorMessage = 'Došlo je do greške prilikom kreiranja grupe.';
        console.error('Error creating group:', error);
      }
    );
  }

  onClose(): void {
    if (this.createGroupForm.dirty) {
      if (!confirm('Imate nespremljene promjene. Da li ste sigurni da želite zatvoriti modal?')) {
        return;
      }
    }
    this.close.emit();
  }
}
