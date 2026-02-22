import {RenderMode, ServerRoute} from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'booking/:id',
    renderMode: RenderMode.Server,
  },
  {
    path: 'payment/:id',
    renderMode: RenderMode.Server,
  },
  {
    path: 'worker',
    renderMode: RenderMode.Server,
  },
  {
    path: 'success/:id',
    renderMode: RenderMode.Server,
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];
