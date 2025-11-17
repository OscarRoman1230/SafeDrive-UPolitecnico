import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: 'tabs',
        loadChildren: () => import('../tabs/tabs.module').then( m => m.TabsPageModule)
      },
      {
        path: 'home',
        loadChildren: () => import('../pages/home/home.module').then( m => m.HomePageModule)
      },
      {
        path: 'register',
        loadChildren: () => import('../pages/register/register.module').then( m => m.RegisterPageModule)
      },
      {
        path: 'history',
        loadChildren: () => import('../pages/history/history.module').then( m => m.HistoryPageModule)
      },
      {
        path: 'statistics',
        loadChildren: () => import('../pages/statistics/statistics.module').then( m => m.StatisticsPageModule)
      },
      {
        path: 'configuration',
        loadChildren: () => import('../pages/configuration/configuration.module').then( m => m.ConfigurationPageModule)
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TabsPageRoutingModule {}
