import { PartialType } from '@nestjs/swagger';
import { CreatePacienteDto } from './create-paciente.dto';

export class UpdateUsuarioDto extends PartialType(CreatePacienteDto) {}
