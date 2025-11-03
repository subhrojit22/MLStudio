const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();
const faqsFilePath = path.join(__dirname, '..', 'faqs.json');

async function main() {
  try {
    const faqsData = fs.readFileSync(faqsFilePath, 'utf-8');
    const faqs = JSON.parse(faqsData);

    for (const faq of faqs) {
      // Check if a similar FAQ already exists to avoid duplicates
      const existingFaq = await prisma.fAQ.findFirst({
        where: {
          question: faq.question,
        },
      });

      if (!existingFaq) {
        await prisma.fAQ.create({
          data: {
            question: faq.question,
            easyAnswer: faq.easyAnswer,
            detailedAnswer: faq.detailedAnswer,
            category: faq.category,
            difficulty: faq.difficulty,
            tags: JSON.stringify(faq.tags),
            order: faq.order,
            views: faq.views,
            helpful: faq.helpful,
            chapterId: faq.chapterId,
          },
        });
        console.log(`Added FAQ: ${faq.question}`);
      } else {
        console.log(`Skipping existing FAQ: ${faq.question}`);
      }
    }

    console.log('Finished loading FAQs.');
  } catch (error) {
    console.error('Error loading FAQs:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
