import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { VideoService } from 'src/app/services/video.service';
import { AuthService } from 'src/app/services/auth.service';
import { User } from 'src/app/models/user.class';
import { Video } from 'src/app/models/video.class';

@Component({
  selector: 'app-myvideos',
  templateUrl: './myvideos.component.html',
  styleUrls: ['./myvideos.component.scss']
})
export class MyvideosComponent implements OnInit
{
  userProfile?: any;
  myVideos: Video[] = [];
  // videoForm!: FormGroup;
 
  videoForm = this.formBuilder.group({
    title: ['', Validators.required],
    description: ['', Validators.required],
    category: ['', Validators.required],
    video_file: [null, Validators.required],
    
  }); 


  selectedFile: File | null = null;
  // onFileSelected(event: any) {
  //   this.selectedFile = event.target.files[0];
  // }

  onFileSelected(event: Event) {
    const element = event.currentTarget as HTMLInputElement;
    let file: File | null = element.files ? element.files[0] : null;
    if (file) {
      this.videoForm.patchValue({ video_file: file as any | null });
      this.videoForm.get('video_file')?.updateValueAndValidity();
      this.selectedFile = file; // Ihre bestehende Logik zur Speicherung der Datei
    }
  }

  constructor( private formBuilder: FormBuilder, public videoService: VideoService, private authService : AuthService){
  
  }
  
  ngOnInit(){
    this.loadMyVideos();
    
  }

 
  async loadMyVideos() {
    // Benutzerdaten abrufen
    const userProfile = await this.authService.getLoggedUserData();
      this.userProfile = userProfile;
      const userId = this.userProfile.id;
         // Auf Änderungen in videosSubject reagieren
         this.videoService.videos$.subscribe(videos => {
          console.log('Alle Videos:',videos);
          // Filtern der Videos, die vom eingeloggten Benutzer erstellt wurden
          this.myVideos = videos.filter(video => video.created_from === userId);
          console.log(this.myVideos);
        });

  }

  onUpload() {
    console.log('onUpload Aufruf');
    if (this.videoForm.valid && this.selectedFile) {
      console.log('onUpload valid');
      const formData = new FormData();
      formData.append('title', this.videoForm.value.title ??'')
      formData.append('description', this.videoForm.value.description ?? '')
      formData.append('video_file', this.selectedFile, this.selectedFile.name);
      formData.append('category', this.videoForm.value.category ?? 'allgemein');
     
      formData.append('myFile', this.selectedFile, this.selectedFile.name);
      console.log('FormData vor dem Senden:', formData);

      this.videoService.postVideo(formData).subscribe({
        next: (response) => {
          console.log('Video erfolgreich hochgeladen', response);
          this.videoService.getVideos();
        },
        error: (error) => {
          console.log('Fehler beim Hochladen des Videos', error);
        }
      })
     
    }
  }

  deleteVideo(videoId: number) {
    console.log('delete', videoId);
    this.videoService.deleteVideo(videoId);
  }
}
