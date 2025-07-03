const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const KakaoStrategy = require('passport-kakao').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken');
const { User } = require('../models');

/**
 * JWT 전략 설정
 */
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET || 'your-secret-key'
};

passport.use(new JwtStrategy(jwtOptions, async (payload, done) => {
  try {
    const user = await User.findByPk(payload.id);
    if (user) {
      return done(null, user);
    }
    return done(null, false);
  } catch (error) {
    return done(error, false);
  }
}));

/**
 * 카카오 OAuth 전략 설정
 */
if (process.env.KAKAO_CLIENT_ID) {
  passport.use(new KakaoStrategy({
    clientID: process.env.KAKAO_CLIENT_ID,
    clientSecret: process.env.KAKAO_CLIENT_SECRET,
    callbackURL: process.env.KAKAO_CALLBACK_URL || '/api/auth/kakao/callback'
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      // 기존 사용자 확인
      let user = await User.findOne({
        where: {
          oauth_provider: 'kakao',
          oauth_id: profile.id
        }
      });

      if (user) {
        return done(null, user);
      }

      // 새 사용자 생성
      user = await User.create({
        oauth_provider: 'kakao',
        oauth_id: profile.id,
        // 카카오에서 제공하는 추가 정보가 있다면 여기에 추가
      });

      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }));
}

/**
 * 구글 OAuth 전략 설정
 */
if (process.env.GOOGLE_CLIENT_ID) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback'
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      // 기존 사용자 확인
      let user = await User.findOne({
        where: {
          oauth_provider: 'google',
          oauth_id: profile.id
        }
      });

      if (user) {
        return done(null, user);
      }

      // 새 사용자 생성
      user = await User.create({
        oauth_provider: 'google',
        oauth_id: profile.id,
        // 구글에서 제공하는 추가 정보가 있다면 여기에 추가
      });

      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }));
}

/**
 * JWT 토큰 생성
 * @param {Object} user - 사용자 객체
 * @returns {string} JWT 토큰
 */
const generateToken = (user) => {
  const payload = {
    id: user.id,
    oauth_provider: user.oauth_provider,
    oauth_id: user.oauth_id
  };

  return jwt.sign(payload, process.env.JWT_SECRET || 'your-secret-key', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

/**
 * JWT 토큰 검증
 * @param {string} token - JWT 토큰
 * @returns {Object} 디코딩된 페이로드
 */
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
};

/**
 * 리프레시 토큰 생성
 * @param {Object} user - 사용자 객체
 * @returns {string} 리프레시 토큰
 */
const generateRefreshToken = (user) => {
  const payload = {
    id: user.id,
    type: 'refresh'
  };

  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET || 'your-refresh-secret', {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d'
  });
};

module.exports = {
  passport,
  generateToken,
  verifyToken,
  generateRefreshToken
};
