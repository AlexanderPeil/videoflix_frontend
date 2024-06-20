import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {
  forgotPasswordForm!: FormGroup;
  isButtonDisabled!: boolean;
  submitted!: boolean;
  sendMailInfo!: boolean;
  invalidMailInfo!: boolean;


  constructor(
    public authService: AuthService,
    private formBuilder: FormBuilder,
    private router: Router,
  ) { }


  ngOnInit() {
    this.initFormGroup();
  }


  initFormGroup() {
    this.forgotPasswordForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]]
    })
  }
 

  onSubmit() {
    this.submitted = true;

    if (this.forgotPasswordForm.invalid) {
      return;
    }
    this.performSendEmail();
  }


  async performSendEmail() {
    try {
      const email = this.forgotPasswordForm.value.email;
      this.isButtonDisabled = true;
      await this.authService.forgotPassword(email);
      this.sendMailInfo = true;
    } catch (err) {
      console.error('Could not send mail.', err);
      this.handlySignUpError();
    }
  }


  handlySignUpError() {
    this.invalidMailInfo = true;
    setTimeout(() => {
      this.invalidMailInfo = false;
      this.forgotPasswordForm.reset();
      this.isButtonDisabled = false;
    }, 3000);
  }

}
