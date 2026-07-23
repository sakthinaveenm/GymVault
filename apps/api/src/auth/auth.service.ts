import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User } from '../schemas/user.schema';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, name, password } = registerDto;
    
    const existing = await this.userModel.findOne({ email }).exec();
    if (existing) {
      throw new ConflictException('Email address already registered');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = new this.userModel({
      email,
      name,
      passwordHash,
    });
    
    await user.save();
    
    const token = this.generateToken(user);
    return {
      success: true,
      message: 'Account created successfully',
      data: {
        user: { email: user.email, name: user.name },
        token,
      },
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.userModel.findOne({ email }).exec();
    if (!user) {
      throw new UnauthorizedException('Invalid email or password credentials');
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException('Invalid email or password credentials');
    }

    const token = this.generateToken(user);
    return {
      success: true,
      message: 'Logged in successfully',
      data: {
        user: { email: user.email, name: user.name },
        token,
      },
    };
  }

  private generateToken(user: User): string {
    const payload = { id: user._id.toString(), email: user.email, name: user.name };
    return this.jwtService.sign(payload);
  }
}
