import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BedrockDynamicTableComponent } from './bedrock-dynamic-table.component';

describe('BedrockDynamicTableComponent', () => {
  let component: BedrockDynamicTableComponent;
  let fixture: ComponentFixture<BedrockDynamicTableComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BedrockDynamicTableComponent]
    });
    fixture = TestBed.createComponent(BedrockDynamicTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
