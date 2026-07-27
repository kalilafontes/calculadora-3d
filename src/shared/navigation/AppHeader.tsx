import { useState } from "react";
import { ThemeToggle } from "../theme/ThemeToggle";
import { AppIcon } from "../ui/AppIcon";
import styles from "./AppHeader.module.css";

export function AppHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className={styles.header}>
      <a
        className={styles.brand}
        href="/"
        aria-label="Quanto Cobrar 3D — início"
      >
        <span className={styles.brandMark} aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
        <span>
          Quanto Cobrar <strong>3D</strong>
        </span>
      </a>

      <nav className={styles.desktopNav} aria-label="Navegação principal">
        <a href="/#calculadora" aria-current="page">
          Calculadora
        </a>
        <a href="/#materiais">Materiais</a>
        <a href="/#energia">Impressoras</a>
        <a href="/como-calcular-preco-impressao-3d/">Dicas</a>
      </nav>

      <div className={styles.actions}>
        <ThemeToggle />
        <a className={styles.saveLink} href="#salvar-calculo">
          <AppIcon name="bookmark" size={16} />
          Salvar cálculo
        </a>
        <button
          className={styles.menuButton}
          type="button"
          aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          <span aria-hidden="true">{isMenuOpen ? "×" : "☰"}</span>
        </button>
      </div>

      {isMenuOpen ? (
        <nav
          id="mobile-navigation"
          className={styles.mobileNav}
          aria-label="Navegação mobile"
        >
          <a
            href="/#calculadora"
            aria-current="page"
            onClick={() => setIsMenuOpen(false)}
          >
            Calculadora
          </a>
          <a
            href="/como-calcular-preco-impressao-3d/"
            onClick={() => setIsMenuOpen(false)}
          >
            Dicas e guia de preços
          </a>
          <a href="#salvar-calculo" onClick={() => setIsMenuOpen(false)}>
            Salvar cálculo
          </a>
        </nav>
      ) : null}
    </header>
  );
}
