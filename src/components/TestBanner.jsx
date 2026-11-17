import { TEST_MODE } from '../config'

// Faixa que só aparece no ambiente de teste, para ninguém confundir com o site de verdade
export default function TestBanner() {
  if (!TEST_MODE) return null
  return (
    <div className="test-banner" role="status">
      <span className="test-banner-dot" />
      Ambiente de teste: nada é cobrado
    </div>
  )
}
