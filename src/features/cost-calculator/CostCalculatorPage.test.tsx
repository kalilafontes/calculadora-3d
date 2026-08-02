import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CostCalculatorPage } from "./CostCalculatorPage";

describe("CostCalculatorPage", () => {
  it("exibe resultados e recalcula enquanto o usuário edita", async () => {
    const user = userEvent.setup();
    render(<CostCalculatorPage />);

    expect(screen.getByText("Preço da impressão completa")).toBeInTheDocument();
    expect(screen.getByText("Custo total da mesa")).toBeInTheDocument();

    const weight = screen.getByLabelText("Peso total da impressão");
    await user.clear(weight);
    await user.type(weight, "200");

    expect(
      await screen.findByRole("heading", { name: /46,89/ }),
    ).toBeInTheDocument();
  });

  it("alterna para mão de obra com valor direto", async () => {
    const user = userEvent.setup();
    render(<CostCalculatorPage />);

    await user.click(screen.getByLabelText("Valor direto"));

    expect(
      screen.getByLabelText("Mão de obra da impressão"),
    ).toBeInTheDocument();
    expect(
      screen.queryByLabelText("Tempo de trabalho"),
    ).not.toBeInTheDocument();
  });

  it("preenche a potência oficial conforme impressora e tensão", async () => {
    const user = userEvent.setup();
    render(<CostCalculatorPage />);

    const printer = screen.getByLabelText("Impressora");
    const voltage = screen.getByLabelText("Tensão da impressora");
    const power = screen.getByLabelText("Potência da impressora");

    await user.selectOptions(printer, "bambu-lab-a1");
    expect(power).toHaveValue("350");
    expect(
      screen.getByText(/Potência máxima oficial — estimativa conservadora/),
    ).toBeInTheDocument();

    await user.selectOptions(voltage, "220");
    expect(power).toHaveValue("1300");

    await user.selectOptions(printer, "bambu-lab-a1-mini");
    expect(power).toHaveValue("150");
  });

  it("aplica a estimativa ao selecionar uma distribuidora", async () => {
    const user = userEvent.setup();
    render(<CostCalculatorPage />);

    const energyPrice = screen.getByLabelText("Preço da energia");
    await waitFor(() => expect(energyPrice).toHaveValue("1,1690"));

    await user.clear(energyPrice);
    await user.type(energyPrice, "2");
    expect(energyPrice).toHaveValue("2");

    const distributor = screen.getByLabelText("Distribuidora (opcional)");
    const firstDistributor = distributor.querySelectorAll("option")[1];
    if (!firstDistributor) throw new Error("Distribuidora não encontrada.");
    await user.selectOptions(distributor, firstDistributor);

    await waitFor(() => expect(energyPrice).not.toHaveValue("2"));
    expect(
      screen.getByText(/Estimativa ANEEL para B1 residencial convencional/),
    ).toBeInTheDocument();
  });

  it("não apresenta NaN ou infinito com entrada inválida", async () => {
    const user = userEvent.setup();
    const { container } = render(<CostCalculatorPage />);

    const margin = screen.getByLabelText("Margem de lucro");
    await user.clear(margin);
    await user.type(margin, "100");

    expect(screen.getByText("Revise os valores")).toBeInTheDocument();
    expect(container).not.toHaveTextContent("NaN");
    expect(container).not.toHaveTextContent("Infinity");
  });

  it("persiste o último cálculo válido e permite limpar", async () => {
    const user = userEvent.setup();
    render(<CostCalculatorPage />);

    const weight = screen.getByLabelText("Peso total da impressão");
    await user.clear(weight);
    await user.type(weight, "321");

    await waitFor(
      () =>
        expect(window.localStorage.getItem("calculadora3d:draft:v1")).toContain(
          '"weightGrams":321',
        ),
      { timeout: 1000 },
    );

    await user.click(screen.getByRole("button", { name: "Limpar cálculo" }));

    expect(weight).toHaveValue("100");
    expect(window.localStorage.getItem("calculadora3d:draft:v1")).toBeNull();
  });

  it("leva ao resultado e registra o clique no atalho de resultado", async () => {
    const user = userEvent.setup();
    const gtag = vi.fn();
    const scrollIntoView = vi.fn();
    window.gtag = gtag;
    Element.prototype.scrollIntoView = scrollIntoView;
    render(<CostCalculatorPage />);

    await user.click(screen.getByRole("button", { name: "Ver resultado" }));

    expect(scrollIntoView).toHaveBeenCalledWith({
      behavior: "smooth",
      block: "start",
    });
    expect(gtag).toHaveBeenCalledWith("event", "view_result_clicked");
  });

  it("abre o formulário de orçamento a partir do resultado", async () => {
    const user = userEvent.setup();
    const gtag = vi.fn();
    window.gtag = gtag;
    render(<CostCalculatorPage />);

    await user.click(
      screen.getByRole("button", { name: "Gerar orçamento em PDF" }),
    );

    expect(
      screen.getByRole("dialog", { name: "Gerar orçamento em PDF" }),
    ).toBeInTheDocument();
    expect(gtag).toHaveBeenCalledWith("event", "quotation_opened");
    expect(screen.getByLabelText("Nome ou empresa")).toBeInTheDocument();
    expect(screen.getByLabelText("Nome do cliente")).toBeInTheDocument();
    expect(screen.getByLabelText("Escolher cor da marca")).toHaveValue(
      "#be185d",
    );
    expect(screen.getByLabelText("Cor hexadecimal da marca")).toHaveValue(
      "#BE185D",
    );
  });

  it("oferece acesso ao guia completo de formação de preço", () => {
    render(<CostCalculatorPage />);

    expect(
      screen.getByRole("link", {
        name: "Ler o guia completo de formação de preço",
      }),
    ).toHaveAttribute("href", "/como-calcular-preco-impressao-3d/");
  });
});
