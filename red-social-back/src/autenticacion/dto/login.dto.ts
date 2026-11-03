import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsString() @IsNotEmpty({ message: 'Ingresá tu usuario o correo' })
  usuario: string; // correo o nombre de usuario

  @IsString() @IsNotEmpty({ message: 'Ingresá tu contraseña' })
  password: string;
}