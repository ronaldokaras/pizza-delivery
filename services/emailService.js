const nodemailer = require('nodemailer');

let transporter = null;

// Se variáveis de ambiente de e-mail estiverem definidas, use-as.
// Caso contrário, crie uma conta Ethereal para desenvolvimento.
if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
} else {
  // Conta Ethereal (não bloqueia o fluxo se falhar)
  nodemailer.createTestAccount((err, account) => {
    if (err) {
      console.error('Erro ao criar conta Ethereal:', err);
      return;
    }
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: account.user,
        pass: account.pass
      }
    });
    console.log('📧 Conta Ethereal criada para testes:');
    console.log('   Usuário:', account.user);
    console.log('   Senha:', account.pass);
  });
}

async function sendOrderConfirmation(email, order) {
  if (!transporter) {
    console.log('⚠️ Email não configurado. Pedido não enviado por email.', order);
    return;
  }

  const itemsList = order.items.map(i => `${i.name} x${i.quantity} - R$ ${(i.price * i.quantity).toFixed(2)}`).join('\n');
  const mailOptions = {
    from: '"Pizzaria Delícia" <no-reply@pizzaria.com>',
    to: email,
    subject: `Confirmação do Pedido #${order.id}`,
    text: `
Olá!

Seu pedido foi recebido com sucesso.

Pedido #${order.id}
${itemsList}
Total: R$ ${order.total.toFixed(2)}
Forma de pagamento: ${order.payment_method || 'Não informada'}

Obrigado pela preferência!
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('📧 Email enviado:', info.messageId);
    if (info.messageId) {
      console.log('URL de visualização:', nodemailer.getTestMessageUrl(info));
    }
  } catch (err) {
    console.error('Erro ao enviar email:', err);
  }
}

module.exports = { sendOrderConfirmation };