import Link from 'next/link'
import { useRouter } from 'next/router'

import styles from './header.module.scss'

export default function Header() {
  const router = useRouter()

  function handleclick(){
    router.push('/', '', {})
  }

  return(
    <header className={styles.headerContainer}>
      <div className={styles.headerContent}>
        {/* <Link href="/">
          <a> */}
            <img src="/logo.svg" alt="logo" onClick={handleclick}/>
          {/* </a>
        </Link> */}
      </div>
    </header>
  )
}
