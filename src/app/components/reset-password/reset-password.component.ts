import { Component, OnInit } from '@angular/core';
import { AbstractControlOptions, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm!: FormGroup;
  isButtonDisabled!: boolean;
  submitted!: boolean;
  passwortReset!: boolean;


  constructor(
    public authService: AuthService,
    private formBuilder: FormBuilder,
    private router: Router
  ) { }


  ngOnInit() {
    this.initFormGroup();
  }


  initFormGroup() {
    this.resetPasswordForm = this.formBuilder.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['']
    }, { validators: this.checkPasswords } as AbstractControlOptions);
  }


  checkPasswords(group: FormGroup): ValidationErrors | null {
    if (!group) {
      return null;
    }

    let pass = group.get('password')?.value;
    let confirmPass = group.get('confirmPassword')?.value;
    return pass === confirmPass ? null : { notSame: true }
  }


  onSubmit() {
    this.submitted = true;

    if (this.resetPasswordForm.invalid) {
      return;
    }
    this.performResetPassword();
  }


  async performResetPassword() {
    try {
      const formData = this.resetPasswordForm.value;
      this.isButtonDisabled = true;
      await this.authService.forgotPassword(formData);
      this.passwortReset = true;
      setTimeout(() => {
        this.router.navigateByUrl('/login');
      }, 3000);
    } catch (err) {
      console.error('Could not reset password.', err);
    }
  }

}
