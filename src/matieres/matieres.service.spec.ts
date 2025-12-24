import { Test, TestingModule } from '@nestjs/testing';
import { MatieresService } from './matieres.service';

describe('MatieresService', () => {
  let service: MatieresService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MatieresService],
    }).compile();

    service = module.get<MatieresService>(MatieresService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
