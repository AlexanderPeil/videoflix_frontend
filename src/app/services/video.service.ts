import { Injectable } from '@angular/core';
import { Video } from '../models/video.class';
import { BehaviorSubject, Observable, Subject, take, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class VideoService {
  public videosSubject = new BehaviorSubject<Video[]>([])
  public videos$ = this.videosSubject.asObservable();

  public searchResults = new BehaviorSubject<Video[]>([])

  private myVideosSubject = new BehaviorSubject<Video[]>([])
  public myVideos$ = this.myVideosSubject.asObservable();

  public searchResultsSubject = new BehaviorSubject<Video[]>([]);
  public searchResults$ = this.searchResultsSubject.asObservable();

  private likeUpdate = new BehaviorSubject<number | null>(null);

  private mostLikedVideosSubject = new BehaviorSubject<Video[]>([]);
  public mostLikedVideos$ = this.mostLikedVideosSubject.asObservable();

  private mostSeenVideosSubject = new BehaviorSubject<Video[]>([]);
  public mostSeenVideos$ = this.mostSeenVideosSubject.asObservable();

  private recentVideosSubject = new BehaviorSubject<Video[]>([]);
  public recentVideos$ = this.recentVideosSubject.asObservable();


  constructor(private http: HttpClient) { }

  getVideos(): void {
    const url = environment.baseUrl + '/videos/';
    this.http.get<Video[]>(url).pipe(take(1)).subscribe(
      videos => {
        this.videosSubject.next(videos);
      },
      error => {
        console.error('Fehler beim Laden der Videos:', error)
      }
    );
  }


  deleteVideo(id: number) {
    const url = environment.baseUrl + `/videos/${id}`;
    this.http.delete(url).subscribe(
      (response) => {
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


  notifyLikeUpdate(videoId: number) {
    this.likeUpdate.next(videoId);
  }


  getLikeUpdateListener() {
    return this.likeUpdate.asObservable();
  }


  getTodayVideos() {
    const url = environment.baseUrl + `/videos/videos_today/`;
    return this.http.get<Video[]>(url);
  }


  getYesterdayVideos() {
    const url = environment.baseUrl + `/videos/videos_yesterday/`;
    return this.http.get<Video[]>(url);
  }


  getRecentVideos() {
    const url = environment.baseUrl + `/videos/recentVideos/`;
    return this.http.get<Video[]>(url);
  }


  getMostLikedVideos() {
    const url = environment.baseUrl + `/videos/popular_videos/`;
    this.http.get<Video[]>(url).subscribe(
      mostLiked => {
        this.mostLikedVideosSubject.next(mostLiked);
      },
      error => {
        console.error('Fehler beim Laden der MostLikedVideos:', error)
      }

    );
  }


  incrementViewCount(videoId: number) {
    const url = environment.baseUrl + `/videos/${videoId}/increment-view-count/`;
    return this.http.post(url, null);
  }


  getMostSeenVideos() {
    const url = environment.baseUrl + `/videos/mostSeen_videos/`;
    this.http.get<Video[]>(url).subscribe(
      mostSeen => {
        console.log('Most seen videos loaded', mostSeen);
        this.mostSeenVideosSubject.next(mostSeen);
      },
      error => {
        console.error('Fehler beim Laden der MostSeenVideos:', error)
      }
    );
  }


  searchVideos(searchterm: string): void {
    const url = environment.baseUrl + `/videos-search/?search=${searchterm}`;
    this.http.get<Video[]>(url).subscribe(
      searchResults => {
        this.searchResults.next(searchResults);
      },
      error => {
        console.error('Fehler bei der Suche:', error);
      }
    );
  }


  toggleLike(videoId: number): Observable<any> {
    const url = `${environment.baseUrl}/videos/${videoId}/toggle_like/`;
    return this.http.post(url, {}).pipe(
      tap((response: any) => {
        this.updateLikeList(videoId, response.likes);
      })
    );
  }


  updateLikeList(videoId: number, likes: number[]) {
    this.updateSubject(this.mostLikedVideosSubject, videoId, likes);
    this.updateSubject(this.mostSeenVideosSubject, videoId, likes);
    this.updateSubject(this.recentVideosSubject, videoId, likes);
  }


  updateSubject(subject: BehaviorSubject<Video[]>, videoId: number, likes: number[]) {
    const videos = subject.getValue();
    const video = videos.find(v => v.id === videoId);
    if (video) {
      video.likes = likes;
      subject.next([...videos]);
    }
  }


  loadVideosForType(type: string, subject: BehaviorSubject<Video[]>) {
    const url = `${environment.baseUrl}/videos/${type}/`;
    this.http.get<Video[]>(url).subscribe(videos => subject.next(videos));
  }

}
