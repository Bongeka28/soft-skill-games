import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodeBreakerGameComponent } from './code-breaker-game.component';

describe('CodeBreakerGameComponent', () => {
  let component: CodeBreakerGameComponent;
  let fixture: ComponentFixture<CodeBreakerGameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CodeBreakerGameComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CodeBreakerGameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
