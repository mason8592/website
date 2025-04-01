import styles from './Main.module.css'

function App() {
  return (
    <>
        <div className={styles.mainContainer}>
            <div className={styles.mainTextContainer}>
                <h1 className={styles.mainText}>This is the main page</h1>
                <br />
                <h1 className={styles.mainText}>Maybe I'll add stuff later!</h1>
            </div>
        </div>
    </>
  )
}

export default App