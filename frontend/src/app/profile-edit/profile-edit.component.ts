import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { City } from '../interfaces/city';
import { map, Observable, startWith } from 'rxjs';
import { UserService } from '../../services/user.service';
import { CityService } from '../../services/city.service';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { CanComponentDeactivate } from '../guards/can-component-deactivate';
import { ConfirmDialogService } from '../../services/confirm-dialog.service';
import { LanguageService } from '../../services/language.service';
import { TranslatePipe } from '../pipes/translate.pipe';

@Component({
  selector: 'app-profile-edit',
  imports: [ReactiveFormsModule, CommonModule, NgIf, NgFor, NavbarComponent, TranslatePipe],
  templateUrl: './profile-edit.component.html',
  styleUrl: './profile-edit.component.scss',
})
export class ProfileEditComponent
  implements OnInit, OnDestroy, CanComponentDeactivate
{
  editForm!: FormGroup;
  cities: City[] = [];
  filteredCities$!: Observable<City[]>;
  selectedFile: File | null = null;
  previewUrl: string | ArrayBuffer | null = null;
  fileError: string | null = null;
  showDropdown = false;
  timestamp = Date.now();
  successMessage = '';

  private handleClickOutsideBound = this.handleClickOutside.bind(this);
  private beforeUnloadHandlerBound = this.beforeUnloadHandler.bind(this);

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private cityService: CityService,
    private router: Router,
    private confirmDialogService: ConfirmDialogService,
    private languageService: LanguageService,
  ) {}

  ngOnInit(): void {
    this.timestamp = Date.now();
    this.editForm = this.fb.group({
      fullName: ['', [Validators.required]],
      phoneNumber: [
        '',
        [Validators.required, Validators.pattern(/^\+387[0-9]{8,9}$/)],
      ],
      location: [''],
      profilePictureUrl: [''],
    });

    this.userService.getMyProfile().subscribe((profile) => {
      this.editForm.patchValue({
        fullName: profile.fullName,
        phoneNumber: profile.phoneNumber,
        location: profile.location || '',
        profilePictureUrl: profile.profilePictureUrl,
      });

      if (
        profile.profilePictureUrl &&
        profile.profilePictureUrl.trim().toLowerCase() !== 'default-profile.png'
      ) {
        this.previewUrl = profile.profilePictureUrl;
      } else {
        this.previewUrl = null;
      }

      this.editForm.markAsPristine();
    });

    this.cityService.getCities().subscribe((cities) => {
      this.cities = cities;
      this.filteredCities$ = this.editForm.get('location')!.valueChanges.pipe(
        startWith(''),
        map((value) => this._filterCities(value)),
      );
    });
    document.addEventListener('click', this.handleClickOutsideBound);
    window.addEventListener('beforeunload', this.beforeUnloadHandlerBound);
  }

  ngOnDestroy(): void {
    document.removeEventListener('click', this.handleClickOutsideBound);
    window.removeEventListener('beforeunload', this.beforeUnloadHandlerBound);
  }

  handleClickOutside(event: Event): void {
    const inputElement = document.getElementById('location');
    const dropdownElement = document.querySelector('.list-group');

    if (
      this.showDropdown &&
      inputElement &&
      dropdownElement &&
      !inputElement.contains(event.target as Node) &&
      !dropdownElement.contains(event.target as Node)
    ) {
      this.showDropdown = false;
    }
  }

  private _filterCities(value: string): City[] {
    const filterValue = value.toLowerCase();
    return this.cities.filter((city) =>
      city.naziv.toLowerCase().includes(filterValue),
    );
  }

  selectCity(city: City): void {
    this.editForm.get('location')?.setValue(city.naziv);

    this.editForm.get('location')?.markAsDirty();

    this.showDropdown = false;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      return;
    }
    const file = input.files[0];

    if (!file.type.startsWith('image/')) {
      this.fileError = this.languageService.translate('selectValidImage');
      return;
    }

    this.fileError = null;
    this.selectedFile = file;

    const reader = new FileReader();
    reader.onload = () => {
      this.previewUrl = reader.result;
      this.editForm.markAsDirty();
    };
    reader.readAsDataURL(file);
  }

  onSubmit(): void {
    if (this.editForm.invalid) {
      return;
    }

    if (this.selectedFile) {
      const formData = new FormData();
      formData.append('file', this.selectedFile);
      this.userService.uploadProfilePicture(formData).subscribe({
        next: (res: any) => {
          this.editForm.get('profilePictureUrl')?.setValue(res.imageUrl);
          this.updateProfile();
        },
        error: (err) => {
          console.error('Greška pri uploadu slike', err);
          this.fileError = this.languageService.translate('uploadImageError');
        },
      });
    } else {
      this.updateProfile();
    }
  }

  handleImageError(): void {
    this.previewUrl = null;
    this.editForm.get('profilePictureUrl')?.setValue(null);
  }

  private updateProfile(): void {
    this.userService.updateProfile(this.editForm.value).subscribe({
      next: () => {
        this.userService.refreshProfile();
        this.successMessage = this.languageService.translate('profileUpdated');
        this.editForm.markAsPristine();
        setTimeout(() => {
          this.router.navigate(['/moj-profil']);
        }, 0);
      },
      error: (err) => {
        console.error('Greška pri ažuriranju profila', err);
        if (err.error && err.error.errors) {
          console.error('Validacijske greške:', err.error.errors);
        }
      },
    });
  }

  removeProfilePicture(): void {
    this.previewUrl = null;
    this.selectedFile = null;
    this.editForm.get('profilePictureUrl')?.setValue(null);

    const fileInput = document.getElementById(
      'profilePicture',
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }

    this.userService.deleteProfilePicture().subscribe({
      next: () => {
        this.editForm.markAsDirty();
        const fileInput = document.getElementById(
          'profilePicture',
        ) as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      },
      error: (err) => console.error('Greška pri uklanjanju slike', err),
    });
    this.editForm.markAsDirty();
  }

  beforeUnloadHandler(event: BeforeUnloadEvent) {
    if (this.editForm.dirty) {
      event.returnValue = this.languageService.translate('unsavedChangesConfirm');
    }
  }

  canDeactivate(): boolean | Observable<boolean> | Promise<boolean> {
    if (this.editForm.dirty) {
      return this.confirmDialogService.confirm('unsavedChangesConfirm');
    }
    return true;
  }
}
