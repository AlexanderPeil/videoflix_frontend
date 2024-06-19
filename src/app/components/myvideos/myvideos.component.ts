import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { VideoService } from 'src/app/services/video.service';
import { AuthService } from 'src/app/services/auth.service';
import { Video } from 'src/app/models/video.class';

@Component({
  selector: 'app-myvideos',
  templateUrl: './myvideos.component.html',
  styleUrls: ['./myvideos.component.scss']
})
export class MyvideosComponent implements OnInit {
  submitted = false;
  editVideoForm!: FormGroup;
  selectedVideo: any = null;
  userProfile?: any;
  myVideos: Video[] = [];
  selectedFile: File | null = null;
  filmRatings = Array.from({ length: 19 }, (v, k) => k);
  curentfilmRating: number = 0;
  currentCategory: string = 'allgemein';
  showUploadMessage: boolean = false;
  uploadMessage: string = '';
  activateUploadbtn: boolean = true;
  loading: boolean = false;
  @ViewChild('fileInput') fileInputVariable: ElementRef | undefined;

  videoForm = this.formBuilder.group({
    title: ['', Validators.required],
    description: ['', Validators.required],
    category: ['', Validators.required],
    video_file: [null, Validators.required],
    film_rating: [0, Validators.required]
  });

  constructor(private formBuilder: FormBuilder, public videoService: VideoService, private authService: AuthService) { }

  ngOnInit() {
    this.videoService.getVideos();
    this.initFormGroup();
    this.loadMyVideos();
  }


  async loadMyVideos() {
    const userProfile = await this.authService.getLoggedUserData();
    this.userProfile = userProfile;
    const userId = this.userProfile.id;
    this.videoService.videos$.subscribe(videos => {
      this.myVideos = videos.filter(video => video.created_from === userId);
    });
  }


  onFileSelected(event: Event) {
    const element = event.currentTarget as HTMLInputElement;
    let file: File | null = element.files ? element.files[0] : null;
    if (file) {
      this.videoForm.patchValue({ video_file: file as any | null });
      this.videoForm.get('video_file')?.updateValueAndValidity();
      this.selectedFile = file;
    }
  }


  onUpload() {
    if (this.videoForm.valid && this.selectedFile) {
      const formData = this.createFormData();
      this.toggleUploadState(true);

      this.videoService.postVideo(formData).subscribe({
        next: () => this.handleUploadSuccess(),
        error: (error) => this.handleUploadError(error)
      });
    }
  }


  createFormData(): FormData {
    const formData = new FormData();
    formData.append('title', this.videoForm.value.title ?? '');
    formData.append('description', this.videoForm.value.description ?? '');

    if (this.selectedFile) {
      formData.append('video_file', this.selectedFile, this.selectedFile.name);
      formData.append('myFile', this.selectedFile, this.selectedFile.name);
    }

    formData.append('category', this.videoForm.value.category ?? 'allgemein');
    formData.append('film_rating', this.videoForm.value.film_rating?.toString() ?? '0');

    return formData;
  }


  toggleUploadState(isUploading: boolean): void {
    this.activateUploadbtn = !isUploading;
    this.loading = isUploading;
  }


  handleUploadSuccess(): void {
    this.resetForm();
    this.showUploadMessage = true;
    this.uploadMessage = 'Vielen Dank für den Upload eines neuen Videos. Wir schalten es nach Überprüfung frei. Dies kann bis zu 24 Stunden dauern.';
    this.videoService.getVideos();
  }


  handleUploadError(error: any): void {
    console.error('Fehler beim Hochladen des Videos', error);
    this.toggleUploadState(false);
  }


  resetForm(): void {
    this.videoForm.reset();
    this.selectedFile = null;
    this.curentfilmRating = 0;
    this.currentCategory = 'allgemein';
    if (this.fileInputVariable && this.fileInputVariable.nativeElement) {
      this.fileInputVariable.nativeElement.value = '';
    }
  }


  deleteVideo(videoId: number) {
    this.videoService.deleteVideo(videoId);
  }


  deleteSelectedVideo() {
    this.selectedVideo = null;
  }


  onSelectVideo(video: Video): void {
    this.selectedVideo = video;
  }


  async showVideoData(videoData: Video) {
    try {
      this.selectedVideo = videoData;
      this.editVideoForm.patchValue({
        category: videoData.category,
        title: videoData.title,
        description: videoData.description
      });
    } catch (err) {
      console.error('Could not load user data', err);
    }
  }


  initFormGroup() {
    this.editVideoForm = this.formBuilder.group({
      title: ['', [Validators.required]],
      description: ['', [Validators.required]],
      category: ['', [Validators.required]],
      film_rating: ['', [Validators.required]],
    });
  }


  saveChanges(video: Video) {
    if (this.editVideoForm.valid) {
      const formData = new FormData();
      formData.append('title', this.editVideoForm.get('title')?.value);
      formData.append('description', this.editVideoForm.get('description')?.value);
      formData.append('category', this.editVideoForm.get('category')?.value);
      formData.append('film_rating', this.editVideoForm.get('film_rating')?.value);
      const videoId = video.id;
      if (videoId !== undefined) {
        this.videoService.updateVideo(formData, videoId);
      }
    }
  }


  selectRating(rating: number) {
    const filmRatingControl = this.videoForm.get('film_rating');
    if (filmRatingControl) {
      filmRatingControl.setValue(rating);
      this.curentfilmRating = rating;
    }
  }


  selectCategory(category: string) {
    const categoryControl = this.videoForm.get('category');
    if (categoryControl) {
      categoryControl.setValue(category);
      this.currentCategory = category;
    }
  }
  

  showForm() {
    this.showUploadMessage = false;
    this.activateUploadbtn = true;
    this.loading = false;
  }
}
