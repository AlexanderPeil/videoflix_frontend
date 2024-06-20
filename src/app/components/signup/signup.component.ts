import { Component, OnInit } from '@angular/core';
import { AbstractControlOptions, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';


@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {
  errorMessage: string | null = null;
  signUpForm!: FormGroup;
  submitted!: boolean;
  signedUpInfo!: boolean;
  isButtonDisabled!: boolean;
  passwordInputFocused: boolean = false;



  constructor(
    public authService: AuthService,
    private router: Router,
    private formBuilder: FormBuilder
  ) { }


  ngOnInit() {
    this.initFormGroup();
  }


  initFormGroup() {
    this.signUpForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      username: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(8)]],
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


  async onSubmit() {
    this.submitted = true;

    if (this.signUpForm.invalid) {
      return;
    }
    await this.performSignup();
  }


  async performSignup() {
    try {
      const formData = this.signUpForm.value;
      let resp: any = await this.authService.signup(formData);
      localStorage.setItem('token', resp.token);
      this.signedUpInfo = true;
      this.isButtonDisabled = true;
    } catch (err) {
      console.error('Could not signup.', err);
      this.handleSignUpError(err);
    }
  }


  handleSignUpError(err: any) {
    this.errorMessage = null;
    if (err.status === 400 && err.error) {
      const passwordErrors = err.error.password || [];
      for (let error of passwordErrors) {
        if (error === "This password is too common.") {
          this.errorMessage = "Dieses Passwort ist zu schwach.";
          break;
        } else if (error === "This password is entirely numeric.") {
          this.errorMessage = "Dieses Passwort besteht nur aus Zahlen.";
          break;
        }
      }
      if (!this.errorMessage) {
        this.errorMessage = "Es ist ein Fehler bei der Registrierung aufgetreten. Bitte versuchen Sie es erneut.";
      }
    } else {
      this.errorMessage = "Ein unbekannter Fehler ist aufgetreten. Bitte versuchen Sie es später noch einmal.";
    }
    setTimeout(() => {
      this.errorMessage = null;
    }, 3000);
  }



  onPasswordFocus() {
    this.passwordInputFocused = true;
  }

  onPasswordBlur() {
    this.passwordInputFocused = false;
  }

}
