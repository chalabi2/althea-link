import { useRouter } from 'next/router'

// AltheaL SVG icon component
export const AltheaL1 = ({ theme }) => {
  const router = useRouter()
  const { asPath } = router
  const isLiquid = asPath === '/liquid-infrastructure' || asPath === '/chapters'
  return (
    <svg id="althea-l1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36.58 26.02">
      <g id="group">
        <path fill={theme == 'white' || isLiquid ? '#fff' : '#07f'} d="m0,0v26.02h15.18v-4.36H4.92V0H0Zm23.19,0l-6.45,7.68,3.06,2.57,5.67-6.71h.34v18.49h-7.16v3.99h17.93v-3.99h-5.96V0h-7.42Z"/>
      </g>
    </svg>
  )
}
