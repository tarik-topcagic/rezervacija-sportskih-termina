import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Group } from '../interfaces/group.model';
import { GroupService } from '../../services/group.service';
import { NgIf } from '@angular/common';
import { ConfirmDialogService } from '../../services/confirm-dialog.service';
import { TranslatePipe } from '../pipes/translate.pipe';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-edit-group-modal',
  imports: [NgIf, ReactiveFormsModule, TranslatePipe],
  templateUrl: './edit-group-modal.component.html',
  styleUrl: './edit-group-modal.component.scss'
})
export class EditGroupModalComponent implements OnInit {
  @Input() group!: Group; 
  @Output() close = new EventEmitter<void>();
  @Output() groupUpdated = new EventEmitter<Group>();

  editGroupForm: FormGroup;
  selectedImage: File | null = null;
  previewUrl: string | null = null;
  isSubmitting: boolean = false;
  errorMessage: string = '';

  constructor(
    private groupService: GroupService,
    private fb: FormBuilder,
    private confirmDialogService: ConfirmDialogService,
    private languageService: LanguageService,
  ) {
    this.editGroupForm = this.fb.group({
      name: ['', Validators.required],
      description: ['']
    });
  }

  ngOnInit(): void {
    this.editGroupForm.patchValue({
      name: this.group.name,
      description: this.group.description
    });

    if (this.group.imageUrl && this.group.imageUrl !== 'default-group.png') {
      this.previewUrl = this.group.imageUrl;
    }
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      this.selectedImage = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result as string;
        this.editGroupForm.markAsDirty();
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(): void {
    this.selectedImage = null;
    this.previewUrl = null;
    this.editGroupForm.markAsDirty();
  }
  
  submitGroup(): void {
    if (this.editGroupForm.invalid) {
      return;
    }
    this.isSubmitting = true;
    this.errorMessage = '';
  
    const data = {
      Name: this.editGroupForm.value.name,
      Description: this.editGroupForm.value.description,
      GroupPictureUrl: this.previewUrl ? this.previewUrl : ""
    };
  
    console.log('Payload za update:', data); 
  
    this.groupService.updateGroup(this.group.id, data).subscribe(
      (response) => {
        this.isSubmitting = false;
        this.groupUpdated.emit(response);
      },
      (error) => {
        this.isSubmitting = false;
        this.errorMessage = this.languageService.translate('updateGroupError');
        console.error('Error updating group:', error);
      }
    );
  }
  
  async onClose(): Promise<void> {
    if (this.editGroupForm.dirty) {
      if (!(await this.confirmDialogService.confirm('unsavedChangesConfirm'))) {
        return;
      }
    }
    this.close.emit();
  }
}
