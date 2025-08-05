import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MemoryFocusGameComponent } from './memory-focus-game.component';

describe('MemoryFocusGameComponent', () => {
  let component: MemoryFocusGameComponent;
  let fixture: ComponentFixture<MemoryFocusGameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MemoryFocusGameComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MemoryFocusGameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
