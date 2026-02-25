import { Wrench } from "lucide-react";
import styles from "./login.module.css";
import LoginForm from "./LoginForm";

export default function LoginPage() {
    return (
        <div className={styles.loginContainer}>
            <div className={styles.loginCard}>
                <div className={styles.loginHeader}>
                    <div className={styles.iconBox}>
                        <Wrench size={32} />
                    </div>
                    <h1 className={styles.title}>
                        LF <span>Aluguel</span>
                    </h1>
                    <p className={styles.subtitle}>Acesso Restrito ao Sistema</p>
                </div>
                <LoginForm />
            </div>
        </div>
    );
}
