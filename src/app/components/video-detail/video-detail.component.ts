import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Subscription, interval, switchMap, takeUntil, takeWhile, timer } from 'rxjs';
import { Video, VideoQuality } from 'src/app/models/video.class';
import { AuthService } from 'src/app/services/auth.service';
import { SignupData } from 'src/app/services/user-interface';
import { VideoService } from 'src/app/services/video.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-video-detail',
  templateUrl: './video-detail.component.html',
  styleUrls: ['./video-detail.component.scss']
})
export class VideoDetailComponent implements OnInit, OnDestroy {
  videoId: number | undefined;
  video: Video | undefined;
  currentVideoSrc: string = '';
  videoQualities: VideoQuality[] = [];
  selectedQuality: string = '';
  videoLiked!: boolean;
  currentUser!: SignupData;
  unsubscribe: Subscription | undefined;
  loadingVideoQuality: boolean = true;
  isLoading: boolean = false;
  videoQualitiesReady = new BehaviorSubject<boolean>(false);
  @ViewChild('videoPlayer') videoPlayer: any;


  constructor(
    private route: ActivatedRoute,
    public videoService: VideoService,
    private authService: AuthService,
    private location: Location) { }


  ngOnInit() {
    this.getLoggedUserData();
    const id = this.route.snapshot.paramMap.get('id');
    if (id !== null) {
      this.videoId = Number(id);
      this.unsubscribe = this.videoService.getVideobyId(this.videoId).subscribe((video) => {
        this.video = video;
        console.log(this.video);

        this.checkVideoLikes();
        this.currentVideoSrc = this.video.video_file;
        this.videoQualities = video.qualities || [];
        this.pollForVideoQualities(video.id);
      });
      if (isNaN(this.videoId)) {
        this.videoId = undefined;
      }
    } else {
      this.videoId = undefined;
    }
  }


  onVideoPlay(videoId: number) {
    this.videoService.incrementViewCount(videoId).subscribe(response => {
      console.log('Video hochgezählt');
    });
  }


  ngOnDestroy(): void {
    if (this.unsubscribe) {
      this.unsubscribe.unsubscribe();
    }
  }


  toggleLikeVideo(videoId: number) {
    this.videoService.toggleLike(videoId).subscribe({
      next: (response: any) => {
        this.video!.likes = response.likes;
        this.getSelectedVideo(videoId);
        this.videoService.notifyLikeUpdate(videoId);
      },
      error: (error) => {
        console.error(error);
      }
    });
  }


  getSelectedVideo(videoId: number) {
    this.videoService.getVideobyId(videoId).subscribe({
      next: (updatedVideo: Video) => {
        this.video = updatedVideo;
        this.checkVideoLikes();
      },
      error: (error: any) => {
        console.error("Fehler beim Abrufen des aktualisierten Videos", error);
      }
    });
  }


  checkVideoLikes() {
    console.log(this.video, this.video?.likes, this.currentUser, this.currentUser.id);

    if (this.video && this.video.likes && this.currentUser && this.currentUser.id !== undefined) {
      this.videoLiked = this.video.likes.includes(this.currentUser.id);
    } else { }
  }


  async getLoggedUserData() {
    try {
      this.currentUser = await this.authService.getLoggedUserData();
      if (this.currentUser) {
        this.checkVideoLikes();
      }
    } catch (err) {
      console.error('Could not load user data', err);
    }
  }


  goBack() {
    this.location.back();
  }


  pollForVideoQualities(videoId: number) {
    const pollingInterval = 10000;
    const stopPollingAfter = 60000;
    const stopPolling$ = timer(stopPollingAfter);
    interval(pollingInterval).pipe(
      switchMap(() => this.videoService.getVideobyId(videoId)),
      takeWhile((video) => this.videoQualities.length <= 2, true),
      takeUntil(stopPolling$)
    ).subscribe(video => {
      this.videoQualities = video.qualities || [];
      if (this.videoQualities.length > 2) {
        this.videoQualitiesReady.next(true);
      }
    });
  }



  changeQuality(qualityVideoFile: string) {
    if (this.video) {
      const videoElement = this.videoPlayer.nativeElement;
      videoElement.pause();
      this.currentVideoSrc = qualityVideoFile;
      videoElement.load();
      videoElement.play();
    }
  }

}
