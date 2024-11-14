import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { BedrockDynamicTableComponent } from './pages/bedrock-dynamic-table/bedrock-dynamic-table.component';

@NgModule({
  declarations: [AppComponent, BedrockDynamicTableComponent],
  imports: [BrowserModule, FormsModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
