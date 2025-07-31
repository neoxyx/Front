import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BreedsListComponent } from './breeds-list.component';
import { CatsService } from '../../../core/services/cats.service';
import { of } from 'rxjs';

describe('BreedsListComponent', () => {
  let component: BreedsListComponent;
  let fixture: ComponentFixture<BreedsListComponent>;
  let catsServiceMock: jasmine.SpyObj<CatsService>;

  beforeEach(async () => {
    catsServiceMock = jasmine.createSpyObj('CatsService', ['getBreeds']);
    catsServiceMock.getBreeds.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [BreedsListComponent],
      providers: [
        { provide: CatsService, useValue: catsServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BreedsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load breeds on init', () => {
    const testBreeds = [{ id: '1', name: 'Test Breed' }];
    catsServiceMock.getBreeds.and.returnValue(of(testBreeds));

    component.ngOnInit();

    expect(catsServiceMock.getBreeds).toHaveBeenCalled();
    expect(component.breeds).toEqual(testBreeds);
  });
});
