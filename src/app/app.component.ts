import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Loader } from '@googlemaps/js-api-loader';
import { } from 'googlemaps';
import * as $ from 'jquery';
import { environment } from 'src/environments/environment';

export interface TableData {
  indirizzo: string;
  comune: string;
}

// Element data for table
const ELEMENT_DATA: TableData[] = [
  { comune: 'Silvano Pietra', indirizzo: 'Via Umberto I, 52' },
  { comune: 'Mozzate', indirizzo: 'Via Sandro Pertini 8A' },
  { comune: 'Voghera', indirizzo: 'Via Paolo Cornaro 5' },
  {
    comune: 'Milano',
    indirizzo: 'Via Privata Angiolo Maffucci 3',
  },
];

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  // Mat Table attributes
  displayedColumns: string[] = ['comune', 'indirizzo', 'editAction'];
  dataSource = ELEMENT_DATA;

  // Map attribute
  map!: google.maps.Map;

  // Class constructor
  constructor(public dialog: MatDialog, public snackBar: MatSnackBar) {}

  // Angular On Init Method
  ngOnInit(): void {
    // Load Google Maps in the browser
    let loader = new Loader({
      apiKey: environment.googleMapsApiKey,
    });

    loader.load().then(() => {
      // Giving default location latitude and longitude (Corso Sempione 78, Milano Italy)
      const location = {
        lat: 45.4850589,
        lng: 9.1607231,
      };

      // Initializing the map
      this.map = new google.maps.Map(document.getElementById('map'), {
        center: location,
        zoom: 18,
      });

      // Creating a marker
      const map = this.map;
      new google.maps.Marker({
        position: location,
        map,
        title: 'default location',
      });

      // Default StreetView Panorama
      var geocoder = new google.maps.Geocoder();
      geocoder.geocode(
        { address: 'Corso Sempione, 78, Milano' },
        function (results, status) {
          if (status === 'OK') {
            new google.maps.StreetViewPanorama(
              document.getElementById('pano'),
              { position: results[0].geometry.location }
            );
          } else {
            console.error(
              "Geocode wasn't successful for the following reason: " + status
            );
          }
        }
      );
    });
  }

  // Get record data and geocode them
  getRecord(row: any): void {
    var snackbar = this.snackBar;
    var geocoder = new google.maps.Geocoder();
    geocoder.geocode(
      { address: row.indirizzo + ', ' + row.comune },
      function (results, status) {
        if (status === 'OK') {
          new google.maps.StreetViewPanorama(document.getElementById('pano'), {
            position: results[0].geometry.location,
          });
          const map = new google.maps.Map(document.getElementById('map'), {
            center: results[0].geometry.location,
            zoom: 19,
          });
          new google.maps.Marker({
            position: results[0].geometry.location,
            map,
            title: 'location clicked on table',
          });
          snackbar.open('Maps updated!', 'close', {
            duration: 2000,
          });
          $('html, body').animate({ scrollTop: 0 }, 0);
        } else {
          console.error(
            "Geocode wasn't successful for the following reason: " + status
          );
        }
      }
    );
  }

  // Method to edit row data in table
  editRow($event: any, row: any): void {
    $event.preventDefault();
    $('#mainContent').css('opacity', '0.7');
    const dialogRef = this.dialog.open(DialogContent, {
      panelClass: 'dialog-modal',
    });
    dialogRef.componentInstance.comune = row.comune;
    dialogRef.componentInstance.indirizzo = row.indirizzo;
    dialogRef.afterClosed().subscribe(() => {
      $('#mainContent').css('opacity', '1');
    });
  }
}

@Component({
  selector: 'dialog-content',
  templateUrl: 'dialog-content.html',
  styleUrls: ['./app.component.css'],
})
export class DialogContent {
  // Attributes
  comune!: FormControl<string>;
  indirizzo!: FormControl<string>;

  // Class constructor
  constructor(public dialog: MatDialog, private snackBar: MatSnackBar) {}

  // Close dialog method
  closeDialog(): void {
    this.dialog.closeAll();
    $('#mainContent').css('opacity', '1');
    this.snackBar.open('Window closed!', 'close', {
      duration: 2000,
    });
  }

  // Update and Save data in the dialog method
  updateAndSaveData($event: any): void {
    console.log(
      'Data updated => indirizzo: ' +
        this.indirizzo +
        ', comune: ' +
        this.comune
    );
    this.dialog.closeAll();
    $('#mainContent').css('opacity', '1');
    $event.preventDefault();
    this.snackBar.open('Data updated!', 'close', {
      duration: 2000,
    });
    //! implement an API Service / update data in database table
  }
}
