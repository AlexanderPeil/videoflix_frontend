import { Injectable } from '@angular/core';
import { Video } from '../models/video.class';
import { BehaviorSubject, Subject, lastValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class VideoService {
  public videosSubject = new BehaviorSubject<Video[]>([])
  public videos$ = this.videosSubject.asObservable();
  private myVideosSubject = new BehaviorSubject<Video[]>([])
  public myVideos$ = this.myVideosSubject.asObservable();
  private likeUpdate = new BehaviorSubject<number | null>(null);
  private mostLikedVideosSubject = new BehaviorSubject<Video[]>([]);
  public mostLikedVideos$ = this.mostLikedVideosSubject.asObservable();
  private mostSeenVideosSubject = new BehaviorSubject<Video[]>([]);
  public mostSeenVideos$ = this.mostSeenVideosSubject.asObservable();


  constructor(private http: HttpClient) { }

  getVideos(): void {
    const url = environment.baseUrl + '/videos/';
    this.http.get<Video[]>(url).subscribe(
      videos => {
        this.videosSubject.next(videos);
      },
      error => {
        console.error('Fehler beim Laden der Videos:', error)
      }
    );
  }


  // getMyVideos():void {
  //   const url = environment.baseUrl + '/videos/?myvideos=true';
  //   this.http.get<Video[]>(url).subscribe(
  //     videos => {
  //       this.myVideosSubject.next(videos);
  //     },
  //     error => {
  //       console.error('Fehler beim Laden der Videos:', error)
  //     }
  //   );
  // }

  deleteVideo(id: number) {
    const url = environment.baseUrl + `/videos/${id}`;
    this.http.delete(url).subscribe(
      (response) => {
        console.log('Video gelöscht', response);
        this.getVideos();
      },
      (error) => {
        console.error('Fehler beim Löschen des Videos', error);

      }
    );
  }

  postVideo(videoData: FormData) {
    const url = environment.baseUrl + `/videos/`;
    return this.http.post(url, videoData);
  }

  updateVideo(videoData: FormData, id: number) {
    const url = environment.baseUrl + `/videos/${id}/`;
    return this.http.put(url, videoData);
  }
  getVideobyId(id: number) {
    const url = environment.baseUrl + `/videos/${id}`;
    return this.http.get<Video>(url);
  }


  toggleLike(videoId: number) {
    const url = environment.baseUrl + `/toggle_like/${videoId}`;
    return this.http.post(url, {});
  }


  notifyLikeUpdate(videoId: number) {
    this.likeUpdate.next(videoId);
  }


  getLikeUpdateListener() {
    return this.likeUpdate.asObservable();
  }

  getTodayVideos(){
    const url = environment.baseUrl + `/videos/videos_today/`;
    return this.http.get<Video[]>(url);
  }

  getYesterdayVideos(){
    const url = environment.baseUrl + `/videos/videos_yesterday/`;
    return this.http.get<Video[]>(url);
  }

  getRecentVideos(){
    const url = environment.baseUrl + `/videos/recentVideos/`;
    return this.http.get<Video[]>(url);
  }

  getMostLikedVideos(){
    const url = environment.baseUrl + `/videos/popular_videos/`;
    this.http.get<Video[]>(url).subscribe(
      mostLiked => {
        this.mostLikedVideosSubject.next(mostLiked);
        console.log('Most liked', mostLiked);
      },
        error => {
          console.error('Fehler beim Laden der MostLikedVideos:', error)
        }

    );
  }

  incrementViewCount(videoId: number){
    const url = environment.baseUrl + `/videos/${videoId}/increment-view-count/`;
    return this.http.post(url,null);
  }

  getMostSeenVideos(){
    const url = environment.baseUrl + `/videos/mostSeen_videos/`;
    this.http.get<Video[]>(url).subscribe(
      mostSeen => {
        this.mostSeenVideosSubject.next(mostSeen);
        console.log('Most seen', mostSeen);
      },
        error => {
          console.error('Fehler beim Laden der MostSeenVideos:', error)
        }

    );
  }

}
