import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'  // Cela permet au service d'être accessible dans toute l'application
})
export class NouvelledemandeService {

  private apiUrl = 'https://ton-api-url.com/formulaire';  // Remplacez cette URL par l'URL de votre API

  constructor(private http: HttpClient) {}

  // Méthode pour envoyer une demande (par exemple, un formulaire)
  envoyerDemande(formData: FormData): Observable<any> {
    return this.http.post(this.apiUrl, formData);
  }
}
