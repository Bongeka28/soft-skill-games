import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CriticalThinkingGameComponent } from './critical-thinking-game.component';

describe('CriticalThinkingGameComponent', () => {
  let component: CriticalThinkingGameComponent;
  let fixture: ComponentFixture<CriticalThinkingGameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CriticalThinkingGameComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CriticalThinkingGameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
