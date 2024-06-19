import { Component, OnDestroy, OnInit } from '@angular/core';
import { Video } from 'src/app/models/video.class';
import { VideoService } from 'src/app/services/video.service';
import { BehaviorSubject, Subscription } from 'rxjs';
import { UserService } from 'src/app/services/user.service';
import { User } from 'src/app/models/user.class';
import { AuthService } from 'src/app/services/auth.service';
import { SignupData } from 'src/app/services/user-interface';
import { Router } from '@angular/router';


@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss']
})
export class OverviewComponent implements OnInit, OnDestroy {
  private users: User[] = [];
  private userSubscription?: Subscription;
  private videoSubscription?: Subscription;
  selectedVideo: any = null;
  videosByCategory: { [category: string]: Video[] } = {};
  private videosByCategorySubject = new BehaviorSubject<{ [category: string]: Video[] }>({});
  public videosByCategory$ = this.videosByCategorySubject.asObservable();
  videoLiked!: boolean;
  currentUser!: SignupData;


  constructor(
    private videoService: VideoService,
    private userService: UserService,
    public router: Router) { }

  ngOnInit() {
    this.videoService.getVideos();
    this.userService.getUserData();
    this.userSubscription = this.userService.users$.subscribe(users => {
      this.users = users;
    });
    this.videoSubscription = this.videoService.videos$.subscribe(videos => {
      this.groupVideosByCategory(videos);
    });
  }


  ngOnDestroy() {
    this.userSubscription?.unsubscribe();
    this.videoSubscription?.unsubscribe();
    const modalElement = document.getElementById('overviewVideoModal');
  }


  private groupVideosByCategory(videos: Video[]) {
    const categoryGroups: { [category: string]: Video[] } = {};
    videos.forEach(video => {
      if (!categoryGroups[video.category]) {
        categoryGroups[video.category] = [];
      }
      categoryGroups[video.category].push(video);
    });
    this.videosByCategorySubject.next(categoryGroups);
  }


}
