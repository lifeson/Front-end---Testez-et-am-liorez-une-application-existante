import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let component: AppComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    // NB : pas de fixture.detectChanges() ici — le template est <router-outlet/>,
    // qui exige un Router configuré. Ces deux cas ne testent que la classe.
  });

  // TU-15 — AppComponent : le composant s'instancie
  // Entrée   : TestBed.createComponent(AppComponent)
  // Sortie   : l'instance est truthy
  it("s'instancie (TU-15)", () => {
    expect(component).toBeTruthy();
  });

  // TU-16 — AppComponent : titre de l'application
  // Entrée   : lecture de component.title
  // Sortie   : 'etudiant-frontend'
  it("expose le titre 'etudiant-frontend' (TU-16)", () => {
    expect(component.title).toEqual('etudiant-frontend');
  });
});