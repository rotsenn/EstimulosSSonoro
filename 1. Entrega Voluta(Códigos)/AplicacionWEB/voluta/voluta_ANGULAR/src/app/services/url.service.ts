import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})

export class UrlService {

    private url = `${environment.base_url}/v1`;
    private url_do = `${environment.base_url_do}/v1`


    constructor(private http: HttpClient) {

    }

    private getHeaders(): any {

      const token: any = localStorage.getItem('x-token');
      if (token) {
        return new HttpHeaders({ 'x-token': token });
      }

    }

    getQuery(query: string): any {
      const url = `${this.url}/${ query }`;
      const headers = this.getHeaders();
      return this.http.get(url, {headers});
    }

    getSingle(query: string): any {
      const url = `${ query }`;
      return this.http.get(url);
    }

    getSingleDO(query: string): any {  //digitalOsean
      const url_do = `${ query }`;
      return this.http.get(url_do);
    }

    postQuery(query: string, data: any): any {
      const url = `${this.url}/${ query }`;
      const headers = this.getHeaders();
      return this.http.post(url, data, {headers});
    }

    putQuery(query: string, data: object ): any {
      const url = `${ this.url }/${ query }`;
      const headers = this.getHeaders();
      return this.http.put(url, data, {headers});
    }

    putAngHeader(query: string, data: object , token: string): any {
      const url = `${ this.url }/${ query }`;
      const headers = new HttpHeaders({ token });
      return this.http.put(url, data, {headers});
    }

    getValidateToken(query: string, token: string): any {
        const url = `${this.url}/${ query }`;
        const headers = new HttpHeaders({ 'x-token': token });
        return this.http.get(url, {headers});
    }

    getExportar(query: string): any { 
      const url = `${this.url}/${ query }`;
      const headers = this.getHeaders();
      return this.http.get(url, {responseType: 'blob', headers},  );
    }

    postQueryM3u(query: string, data: any): any {
      const url = `${this.url_do}/${ query }`;
      const headers = this.getHeaders();
      return this.http.post(url, data, {headers});
    }

}
