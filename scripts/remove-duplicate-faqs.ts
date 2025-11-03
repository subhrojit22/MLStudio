import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function removeDuplicateFAQs() {
  try {
    console.log('🔍 Finding duplicate FAQs...')
    
    // Get all FAQs
    const allFAQs = await prisma.fAQ.findMany({
      include: {
        chapter: {
          select: {
            title: true,
            category: true
          }
        }
      }
    })
    
    console.log(`📊 Total FAQs found: ${allFAQs.length}`)
    
    // Group FAQs by question (case-insensitive)
    const faqGroups = new Map<string, any[]>()
    
    allFAQs.forEach(faq => {
      const normalizedQuestion = faq.question.toLowerCase().trim()
      if (!faqGroups.has(normalizedQuestion)) {
        faqGroups.set(normalizedQuestion, [])
      }
      faqGroups.get(normalizedQuestion)!.push(faq)
    })
    
    // Find duplicates
    const duplicates = Array.from(faqGroups.entries()).filter(([_, faqs]) => faqs.length > 1)
    
    console.log(`🔄 Found ${duplicates.length} groups of duplicate questions`)
    
    if (duplicates.length === 0) {
      console.log('✅ No duplicates found!')
      return
    }
    
    // Process each duplicate group
    let totalRemoved = 0
    
    for (const [question, duplicateFAQs] of duplicates) {
      console.log(`\n📝 Processing duplicate group: "${question}"`)
      console.log(`   Found ${duplicateFAQs.length} duplicates`)
      
      // Sort by views, helpful, and createdAt to keep the best one
      duplicateFAQs.sort((a, b) => {
        // First by views (descending)
        if (b.views !== a.views) {
          return b.views - a.views
        }
        // Then by helpful votes (descending)
        if (b.helpful !== a.helpful) {
          return b.helpful - a.helpful
        }
        // Finally by creation date (newer first)
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      })
      
      // Keep the first one (best), remove the rest
      const keepFAQ = duplicateFAQs[0]
      const removeFAQs = duplicateFAQs.slice(1)
      
      console.log(`   ✅ Keeping: ID ${keepFAQ.id} (${keepFAQ.views} views, ${keepFAQ.helpful} helpful)`)
      
      for (const removeFAQ of removeFAQs) {
        console.log(`   🗑️  Removing: ID ${removeFAQ.id} (${removeFAQ.views} views, ${removeFAQ.helpful} helpful)`)
        
        await prisma.fAQ.delete({
          where: { id: removeFAQ.id }
        })
        
        totalRemoved++
      }
    }
    
    console.log(`\n🎉 Successfully removed ${totalRemoved} duplicate FAQs!`)
    
    // Verify the results
    const remainingFAQs = await prisma.fAQ.count()
    console.log(`📊 Remaining FAQs: ${remainingFAQs}`)
    
  } catch (error) {
    console.error('❌ Error removing duplicates:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the function
removeDuplicateFAQs()