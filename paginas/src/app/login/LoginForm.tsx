"use client";

import { useActionState, useEffect } from "react";
import { authenticate } from "./actions";
import { Building2, Lock, Users } from "lucide-react";
import styles from "./login.module.css";
import { useFormStatus } from "react-dom";

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button type="submit" className={styles.buttonSubmit} disabled={pending}>
            {pending ? "Entrando..." : "Entrar com Credenciais"}
        </button>
    );
}

export default function LoginForm() {
    const [errorMessage, dispatch] = useActionState(authenticate, undefined);

    // Helper para simular login via server action
    const handleSimulacao = (email: string) => {
        const formData = new FormData();
        formData.append("email", email);
        formData.append("password", "admin123");
        // Em um form normal, o action despacharia isso, aqui chamamos via transition ou submetendo manual
        const form = document.createElement("form");
        form.action = "";
        form.method = "POST";

        // Como estamos no React, a forma ideal de simular submissão com useActionState
        // é preencher os inputs e dar requestSubmit
        const emailInput = document.getElementById("email") as HTMLInputElement;
        const passwordInput = document.getElementById("password") as HTMLInputElement;
        if (emailInput && passwordInput) {
            emailInput.value = email;
            passwordInput.value = "admin123";
            emailInput.form?.requestSubmit();
        }
    };

    return (
        <div className={styles.loginBody}>
            {errorMessage && (
                <div className={styles.error}>{errorMessage}</div>
            )}

            <form action={dispatch}>
                <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="email">E-mail</label>
                    <div className={styles.inputWrapper}>
                        <Lock size={18} className={styles.inputIcon} />
                        <input
                            className={styles.input}
                            id="email"
                            name="email"
                            type="email"
                            required
                            placeholder="Digite seu e-mail"
                        />
                    </div>
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="password">Senha</label>
                    <div className={styles.inputWrapper}>
                        <Lock size={18} className={styles.inputIcon} />
                        <input
                            className={styles.input}
                            id="password"
                            name="password"
                            type="password"
                            required
                            placeholder="********"
                        />
                    </div>
                </div>

                <SubmitButton />
            </form>

            <div className={styles.simulacaoBox}>
                <p className={styles.simulacaoTitle}>Simulação de Acesso (Dev)</p>
                <button
                    onClick={() => handleSimulacao("admin@lfaluguel.com")}
                    className={styles.buttonDono}
                    type="button"
                >
                    <Building2 size={18} /> Entrar como DONO
                </button>
                <button
                    onClick={() => alert("Usuário operador não cadastrado no seed ainda. Crie pelo painel do DONO.")}
                    className={styles.buttonOperador}
                    type="button"
                >
                    <Users size={18} /> Entrar como FUNCIONÁRIO
                </button>
            </div>
        </div>
    );
}
