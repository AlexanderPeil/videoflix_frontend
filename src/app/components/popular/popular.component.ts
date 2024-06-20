import { Component, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { Video } from 'src/app/models/video.class';
import { VideoService } from 'src/app/services/video.service';

@Component({
  selector: 'app-popular',
  templateUrl: './popular.component.html',
  styleUrls: ['./popular.component.scss']
})
export class PopularComponent implements OnInit, OnDestroy {
  private videosTodaySubject = new BehaviorSubject<Video[]>([]);
  public videosToday$ = this.videosTodaySubject.asObservable();

  private videosYesterdaySubject = new BehaviorSubject<Video[]>([]);
  public videosYesterday$ = this.videosYesterdaySubject.asObservable();

  private recentVideosSubject = new BehaviorSubject<Video[]>([]);
  public recentVideos$ = this.recentVideosSubject.asObservable();

  private displayedVideosSubject = new BehaviorSubject<Video[]>([]);
  public displayedVideos$ = this.displayedVideosSubject.asObservable();

  private subscription: Subscription = new Subscription();

  constructor(public videoService: VideoService) { }


  ngOnInit(): void {
    this.loadVideos();
  }


  loadVideos() {
    this.getTodayVideos();
    this.getYesterdayVideos();
    this.videoService.getMostLikedVideos();
    this.videoService.getMostSeenVideos();
    this.getRecentVideos();  
  }


  getTodayVideos() {
    this.videoService.getTodayVideos().subscribe(videos => {
      this.videosTodaySubject.next(videos);
      this.displayedVideosSubject.next(videos);
    })
  }


  getRecentVideos() {
    this.videoService.getRecentVideos().subscribe(videos => {
      this.recentVideosSubject.next(videos);
    })
  }


  getYesterdayVideos() {
    this.videoService.getYesterdayVideos().subscribe(videos => {
      this.videosYesterdaySubject.next(videos);
    })
  }


  scrollLeft() {
    const container = document.querySelector('.videoRow');
    container?.scrollBy({ left: -200, behavior: 'smooth' });
  }


  scrollRight() {
    const container = document.querySelector('.videoRow');
    container?.scrollBy({ left: 200, behavior: 'smooth' });
  }


  toggleDisplayVideos(displayToday: boolean) {
    this.subscription.add(
      (displayToday ? this.videosToday$ : this.videosYesterday$).subscribe(videos => {
        this.displayedVideosSubject.next(videos);
      })
    );
  }


  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}
