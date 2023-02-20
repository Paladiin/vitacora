
import Vue from 'vue'
import Router from 'vue-router'

const SubjectDetail = () => import('@/views/subject/SubjectDetail')
const Attention = () => import('@/views/attention/attention')
const Transaction = () => import('@/views/transaction/transaction')
const StockListView = () => import('@/views/stockListView/StockListView')
const InfoDetail = () => import('@/views/infoDetail/InfoDetail')
const RelatedFunds = () => import('@/views/relatedFunds/relatedFunds')

Vue.use(Router)

const router = new Router({
  mode: 'history',
  base: '/h5/jinrijihui',
  routes: [
    {
      path: '/subjectDetail/:id',
      name: 'SubjectDetail',
      component: SubjectDetail
    },
    {
      path: '/attention',
      name: 'Attention',
      component: Attention
    },
    {
      path: '/transaction',
      name: 'Transaction',
      component: Transaction,
      meta: '异动提醒'
    },
    {
      path: '/relatedFunds/:id',
      name: 'RelatedFunds',
      component: RelatedFunds
    },
    {
      path: '/stockList/:id',
      name: 'StockListView',
      component: StockListView
    },
    {
      path: '/infoDetail/:id',
      name: 'InfoDetail',
      component: InfoDetail
    }
  ]
})
// router.
export default router