import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent }   from './app.component';

 

import {FormsModule} from '@angular/forms';
import { NodeService } from './nodeservice';
import { HttpClientModule } from '@angular/common/http';
import { TreeSelectModule } from './components/treeselect/treeselect.module';




@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,

		FormsModule,
    HttpClientModule,
    TreeSelectModule
  ],
  declarations: [ AppComponent ],
  bootstrap:    [ AppComponent ],
  providers: [ NodeService ]
})

export class AppModule { }
