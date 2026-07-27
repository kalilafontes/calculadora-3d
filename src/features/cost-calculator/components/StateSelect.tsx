import type { UseFormRegisterReturn } from "react-hook-form";
import {
  BRAZIL_STATE_CODES,
  type BrazilStateCode,
} from "../../../domain/calculation/calculation.types";
import styles from "./StateSelect.module.css";

const stateNames: Record<BrazilStateCode, string> = {
  AC: "Acre",
  AL: "Alagoas",
  AP: "Amapá",
  AM: "Amazonas",
  BA: "Bahia",
  CE: "Ceará",
  DF: "Distrito Federal",
  ES: "Espírito Santo",
  GO: "Goiás",
  MA: "Maranhão",
  MT: "Mato Grosso",
  MS: "Mato Grosso do Sul",
  MG: "Minas Gerais",
  PA: "Pará",
  PB: "Paraíba",
  PR: "Paraná",
  PE: "Pernambuco",
  PI: "Piauí",
  RJ: "Rio de Janeiro",
  RN: "Rio Grande do Norte",
  RS: "Rio Grande do Sul",
  RO: "Rondônia",
  RR: "Roraima",
  SC: "Santa Catarina",
  SP: "São Paulo",
  SE: "Sergipe",
  TO: "Tocantins",
};

interface StateSelectProps {
  registration: UseFormRegisterReturn;
  className?: string;
}

export function StateSelect({ registration, className }: StateSelectProps) {
  return (
    <div className={`${styles.field} ${className ?? ""}`}>
      <label htmlFor="stateCode" className={styles.label}>
        Estado
      </label>
      <select id="stateCode" className={styles.select} {...registration}>
        {BRAZIL_STATE_CODES.map((stateCode) => (
          <option key={stateCode} value={stateCode}>
            {stateNames[stateCode]} ({stateCode})
          </option>
        ))}
      </select>
      <span className={styles.help}>
        Usamos a média B1 residencial convencional da ANEEL como referência.
      </span>
    </div>
  );
}
