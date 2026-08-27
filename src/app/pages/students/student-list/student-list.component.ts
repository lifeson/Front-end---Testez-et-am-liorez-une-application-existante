import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { MaterialModule } from '../../../shared/material.module';
import { StudentService } from '../../../core/service/student.service';
import { StudentResponse } from '../../../core/models/StudentResponse';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-student-list',
  standalone: true,
  imports: [CommonModule, MaterialModule, RouterLink],
  templateUrl: './student-list.component.html',
  styleUrl: './student-list.component.css'
})
export class StudentListComponent implements OnInit {
  private studentService = inject(StudentService);
  private destroyRef = inject(DestroyRef);

  students: StudentResponse[] = [];
  loading = false;
  errorMessage: string | null = null;

  ngOnInit(): void {
    this.loadStudents();
  }

  loadStudents(): void {
    this.loading = true;
    this.errorMessage = null;

    this.studentService.getAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (students) => {
          this.loading = false;
          this.students = students;
        },
        error: (err: HttpErrorResponse) => {
          this.loading = false;
          this.errorMessage = err.error?.message || 'Impossible de charger la liste des étudiants.';
        }
      });
  }

  deleteStudent(id: number): void {
    if (!confirm('Supprimer cet étudiant ?')) {
      return;
    }

    this.studentService.delete(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.students = this.students.filter(student => student.id !== id);
        },
        error: (err: HttpErrorResponse) => {
          this.errorMessage = err.error?.message || 'Impossible de supprimer cet étudiant.';
        }
      });
  }
}
