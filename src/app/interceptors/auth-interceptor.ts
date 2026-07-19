import { HttpInterceptorFn } from '@angular/common/http';
import { AuthService } from '../services/auth-service';
import { inject } from '@angular/core';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);

  if (req.url.includes('/login')) {
    return next(req);
  }

  const token = auth.getToken();
  const companyId = auth.getCompanyId();

  let request = req;

  if (token) {
    request = request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  if (companyId) {
    request = request.clone({
      setHeaders: {
        'X-Company-Id': companyId
      }
    });
  }

  return next(request);
};
