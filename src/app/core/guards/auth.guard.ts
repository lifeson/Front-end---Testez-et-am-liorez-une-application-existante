import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const token = localStorage.getItem('token');

  if (token) {
    return true;
  }

  // Pas de token en Local Storage : l'utilisateur n'est pas (ou plus) authentifié.
  // Note : ceci ne vérifie que la présence du token, pas sa validité/expiration —
  // un token expiré passera ce test et échouera plus tard, au niveau de l'appel API.
  // TODO : mémoriser l'URL demandée pour y rediriger l'utilisateur après un login réussi  
  router.navigateByUrl('/login');
  return false;
};
