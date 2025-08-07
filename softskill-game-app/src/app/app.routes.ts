import { Routes } from '@angular/router';
import {LoginComponent} from './components/login/login.component';
import {RegisterComponent} from './components/register/register.component';
import {RecruiterDashboardComponent} from './components/recruiter-dashboard/recruiter-dashboard.component';
import {CandidateDashboardComponent} from './components/candidate-dashboard/candidate-dashboard.component';
import {
  CriticalThinkingGameComponent
} from './components/games/critical-thinking-game/critical-thinking-game.component';
import {MemoryFocusGameComponent} from './components/games/memory-focus-game/memory-focus-game.component';
import {CodeBreakerGameComponent} from './components/games/code-breaker-game/code-breaker-game.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'recruiter-dashboard', component: RecruiterDashboardComponent },
  { path: 'candidate-dashboard', component: CandidateDashboardComponent },
  { path: 'game/critical-thinking', component: CriticalThinkingGameComponent },
  { path: 'game/memory-focus', component: MemoryFocusGameComponent },
  {path:  'game/code-breaker',component:CodeBreakerGameComponent}

];
