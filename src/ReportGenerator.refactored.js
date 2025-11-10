// --- Constantes (Adeus Números Mágicos) ---
const PRIORITY_THRESHOLD = 1000;
const STANDARD_USER_VALUE_LIMIT = 500;

/**
 * Interface de formatação (Strategy)
 * Define a "receita" para construir um relatório.
 */
class ReportFormatter {
  generateHeader() {
    throw new Error('Método "generateHeader" não implementado');
  }
  generateRow() {
    throw new Error('Método "generateRow" não implementado');
  }
  generateFooter() {
    throw new Error('Método "generateFooter" não implementado');
  }
}

/**
 * Implementação da Strategy para CSV.
 */
class CsvFormatter extends ReportFormatter {
  generateHeader() {
    return "ID,NOME,VALOR,USUARIO\n";
  }

  generateRow(item, user) {
    return `${item.id},${item.name},${item.value},${user.name}\n`;
  }

  generateFooter(total) {
    return `\nTotal,,\n${total},,\n`;
  }
}

/**
 * Implementação da Strategy para HTML.
 */
class HtmlFormatter extends ReportFormatter {
  generateHeader(user) {
    let report = "<html><body>\n";
    report += "<h1>Relatório</h1>\n";
    report += `<h2>Usuário: ${user.name}</h2>\n`;
    report += "<table>\n";
    report += "<tr><th>ID</th><th>Nome</th><th>Valor</th></tr>\n";
    return report;
  }

  generateRow(item) {
    // A lógica de prioridade (item.priority) é definida no ReportGenerator.
    // O formatador apenas aplica o estilo se a flag existir.
    const style = item.priority ? ' style="font-weight:bold;"' : "";
    return `<tr${style}><td>${item.id}</td><td>${item.name}</td><td>${item.value}</td></tr>\n`;
  }

  generateFooter(total) {
    let report = "</table>\n";
    report += `<h3>Total: ${total}</h3>\n`;
    report += "</body></html>\n";
    return report;
  }
}

/**
 * Factory para selecionar a Strategy (o formatador) correta.
 */
class ReportFormatterFactory {
  static getFormatter(reportType) {
    if (reportType === "CSV") {
      return new CsvFormatter();
    }
    if (reportType === "HTML") {
      return new HtmlFormatter();
    }
    throw new Error(`Tipo de relatório não suportado: ${reportType}`);
  }
}

/**
 * O ReportGenerator agora atua como um "Coordenador".
 * Ele não sabe mais como formatar CSV ou HTML.
 * Ele apenas aplica a lógica de negócios e delega a formatação.
 */
export class ReportGenerator {
  constructor() {
    // O 'database' não utilizado foi removido.
  }

  /**
   * Gera um relatório.
   * A complexidade foi movida para métodos privados e formatadores.
   */
  generateReport(reportType, user, items) {
    const formatter = ReportFormatterFactory.getFormatter(reportType);

    // 1. Aplicar lógica de negócios (filtrar e marcar prioridade)
    const processedItems = this._processItems(user, items);

    // 2. Calcular total (sem duplicar código)
    const total = this._calculateTotal(processedItems);

    // 3. Construir o relatório delegando para o formatador
    let report = "";
    report += formatter.generateHeader(user);

    for (const item of processedItems) {
      report += formatter.generateRow(item, user);
    }

    report += formatter.generateFooter(total);

    return report.trim();
  }

  /**
   * Extraído do método longo (Extract Method).
   * Aplica as regras de negócio (filtragem e prioridade).
   */
  _processItems(user, items) {
    if (user.role === "ADMIN") {
      // Admin vê tudo, com itens caros marcados como prioridade
      return items.map((item) => {
        if (item.value > PRIORITY_THRESHOLD) {
          // Retorna uma cópia para não mutar o original (boa prática)
          return { ...item, priority: true };
        }
        return item;
      });
    }

    if (user.role === "USER") {
      // User vê apenas itens abaixo do limite
      return items.filter((item) => item.value <= STANDARD_USER_VALUE_LIMIT);
    }

    return []; // Retorno padrão
  }

  /**
   * Extraído do método longo (Extract Method) e DRY.
   * Calcula o total de uma lista de itens.
   */
  _calculateTotal(items) {
    return items.reduce((sum, item) => sum + item.value, 0);
  }
}
