import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { MaterialModule } from '../../../shared/material.module';
import { StudentService } from '../../../core/service/student.service';
import { Student } from '../../../core/models/Student';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-student-form',
  standalone: true,
  imports: [CommonModule, MaterialModule, RouterLink],
  templateUrl: './student-form.component.html',
  styleUrl: './student-form.component.css'
})
export class StudentFormComponent implements OnInit {
  private studentService = inject(StudentService);
  private formBuilder = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  studentForm: FormGroup = new FormGroup({});
  submitted: boolean = false;
  loading: boolean = false;
  errorMessage: string | null = null;

  studentId: number | null = null;

  get isEditMode(): boolean {
    return this.studentId !== null;
  }

  ngOnInit(): void {
    this.studentForm = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      dateOfBirth: [''],
      phoneNumber: ['']
    });

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.studentId = Number(idParam);
      this.loadStudent(this.studentId);
    }
  }

  private loadStudent(id: number): void {
    this.loading = true;
    this.studentService.getById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (student) => {
          this.loading = false;
          this.studentForm.patchValue(student);
        },
        error: (err: HttpErrorResponse) => {
          this.loading = false;
          this.errorMessage = err.error?.message || "Impossible de charger cet étudiant.";
        }
      });
  }

  get form() {
    return this.studentForm.controls;
  }

  onSubmit(): void {
    this.submitted = true;
    this.errorMessage = null;

    if (this.studentForm.invalid) {
      return;
    }

    const student: Student = {
      firstName: this.studentForm.get('firstName')?.value,
      lastName: this.studentForm.get('lastName')?.value,
      email: this.studentForm.get('email')?.value,
      dateOfBirth: this.studentForm.get('dateOfBirth')?.value,
      phoneNumber: this.studentForm.get('phoneNumber')?.value
    };

    this.loading = true;
    const request$ = this.isEditMode
      ? this.studentService.update(this.studentId as number, student)
      : this.studentService.create(student);

    request$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.loading = false;
          this.router.navigateByUrl('/students');
        },
        error: (err: HttpErrorResponse) => {
          this.loading = false;
          this.errorMessage = err.error?.message || "Une erreur est survenue lors de l'enregistrement.";
        }
      });
  }

  onReset(): void {
    this.submitted = false;
    this.errorMessage = null;
    this.studentForm.reset();
  }
}
