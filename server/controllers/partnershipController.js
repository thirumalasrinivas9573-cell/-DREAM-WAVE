const {
  createPartnershipRequest,
  respondToRequest,
  listPartnershipsForInstitution,
  listPartnershipsForCompany,
  getPartnershipById,
  assertPartnershipAccess,
  updatePartnership,
  getPartnershipStatsForInstitution,
  getPartnershipStatsForCompany,
  listPartnershipActivity,
  addPartnershipDocument,
  listPartnershipDocuments,
  isValidObjectId,
  RELATIONSHIP_TYPES,
} = require('../services/partnershipService')

function getIo(req) {
  return req.app.get('io')
}

function serialize(doc) {
  if (!doc) return null
  const obj = doc.toObject ? doc.toObject() : doc
  return {
    ...obj,
    id: obj._id?.toString(),
    institution: obj.institutionId,
    company: obj.companyId,
  }
}

function serializeList(items) {
  return items.map((item) => serialize(item))
}

/** POST /api/partnerships/requests */
exports.createRequest = async (req, res) => {
  try {
    const {
      companyId,
      institutionId,
      relationshipType,
      subject,
      message,
      proposedCollaboration,
      contactPerson,
      startDate,
      expectedDuration,
      supportingDocuments,
    } = req.body

    if (!relationshipType) {
      return res.status(400).json({ success: false, message: 'relationshipType is required' })
    }

    let targetInstitutionId
    let targetCompanyId
    let initiatedBy

    if (req.user.role === 'institution') {
      if (!req.institution) {
        return res.status(403).json({ success: false, message: 'Institution profile required' })
      }
      if (!companyId || !isValidObjectId(companyId)) {
        return res.status(400).json({ success: false, message: 'Valid companyId is required' })
      }
      targetInstitutionId = req.institution._id
      targetCompanyId = companyId
      initiatedBy = 'institution'
    } else if (req.user.role === 'company') {
      if (!req.company) {
        return res.status(403).json({ success: false, message: 'Company profile required' })
      }
      if (!institutionId || !isValidObjectId(institutionId)) {
        return res.status(400).json({ success: false, message: 'Valid institutionId is required' })
      }
      targetInstitutionId = institutionId
      targetCompanyId = req.company._id
      initiatedBy = 'company'
    } else {
      return res.status(403).json({ success: false, message: 'Only institution or company users can create requests' })
    }

    const partnership = await createPartnershipRequest({
      institutionId: targetInstitutionId,
      companyId: targetCompanyId,
      initiatedBy,
      initiatorUserId: req.user._id,
      relationshipType,
      subject,
      message,
      proposedCollaboration,
      contactPerson,
      startDate,
      expectedDuration,
      supportingDocuments,
      io: getIo(req),
    })

    res.status(201).json({ success: true, partnership: serialize(partnership) })
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to create partnership request',
    })
  }
}

/** GET /api/partnerships */
exports.listPartnerships = async (req, res) => {
  try {
    const filters = {
      status: req.query.status,
      relationshipType: req.query.relationshipType,
      requestStatus: req.query.requestStatus,
      page: req.query.page,
      limit: req.query.limit,
    }

    let result
    if (req.user.role === 'institution' && req.institution) {
      result = await listPartnershipsForInstitution(req.institution._id, filters)
    } else if (req.user.role === 'company' && req.company) {
      result = await listPartnershipsForCompany(req.company._id, filters)
    } else {
      return res.status(403).json({ success: false, message: 'Access denied' })
    }

    res.json({
      success: true,
      partnerships: serializeList(result.items),
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        pageCount: result.pageCount,
      },
    })
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to list partnerships',
    })
  }
}

/** GET /api/partnerships/stats */
exports.getStats = async (req, res) => {
  try {
    let stats
    if (req.user.role === 'institution' && req.institution) {
      stats = await getPartnershipStatsForInstitution(req.institution._id)
    } else if (req.user.role === 'company' && req.company) {
      stats = await getPartnershipStatsForCompany(req.company._id)
    } else {
      return res.status(403).json({ success: false, message: 'Access denied' })
    }
    res.json({ success: true, stats })
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to get stats',
    })
  }
}

/** GET /api/partnerships/meta */
exports.getMeta = (_req, res) => {
  res.json({ success: true, relationshipTypes: RELATIONSHIP_TYPES })
}

/** GET /api/partnerships/:id */
exports.getPartnership = async (req, res) => {
  try {
    const partnership = await getPartnershipById(req.params.id)
    await assertPartnershipAccess(partnership, {
      institution: req.institution,
      company: req.company,
    })
    res.json({ success: true, partnership: serialize(partnership) })
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to get partnership',
    })
  }
}

/** PATCH /api/partnerships/:id */
exports.updatePartnership = async (req, res) => {
  try {
    const role = req.user.role === 'institution' || req.user.role === 'company' ? req.user.role : null
    if (!role) {
      return res.status(403).json({ success: false, message: 'Access denied' })
    }

    const partnership = await updatePartnership(
      req.params.id,
      req.body,
      {
        userId: req.user._id,
        role,
        institution: req.institution,
        company: req.company,
      },
    )
    res.json({ success: true, partnership: serialize(partnership) })
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to update partnership',
    })
  }
}

/** POST /api/partnerships/:id/respond */
exports.respondToRequest = async (req, res) => {
  try {
    const { action, responseMessage } = req.body
    if (!['accept', 'decline', 'info_requested'].includes(action)) {
      return res.status(400).json({ success: false, message: 'Invalid action' })
    }

    const partnership = await getPartnershipById(req.params.id)
    await assertPartnershipAccess(partnership, {
      institution: req.institution,
      company: req.company,
    })

    const responderRole = req.user.role
    if (partnership.initiatedBy === responderRole) {
      return res.status(403).json({
        success: false,
        message: 'Cannot respond to your own partnership request',
      })
    }

    const updated = await respondToRequest({
      partnershipId: req.params.id,
      responderUserId: req.user._id,
      responderRole,
      action,
      responseMessage,
      io: getIo(req),
    })

    res.json({ success: true, partnership: serialize(updated) })
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to respond to request',
    })
  }
}

/** GET /api/partnerships/:id/activity */
exports.getActivity = async (req, res) => {
  try {
    const partnership = await getPartnershipById(req.params.id)
    await assertPartnershipAccess(partnership, {
      institution: req.institution,
      company: req.company,
    })

    const result = await listPartnershipActivity(req.params.id, {
      page: req.query.page,
      limit: req.query.limit,
    })

    res.json({ success: true, activity: result.items, pagination: result })
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to get activity',
    })
  }
}

/** GET /api/partnerships/:id/documents */
exports.listDocuments = async (req, res) => {
  try {
    const docs = await listPartnershipDocuments(req.params.id, {
      institution: req.institution,
      company: req.company,
    })
    res.json({ success: true, documents: docs })
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to list documents',
    })
  }
}

/** POST /api/partnerships/:id/documents */
exports.addDocument = async (req, res) => {
  try {
    const { name, type, fileUrl, fileName, expiryDate } = req.body
    if (!name || !type) {
      return res.status(400).json({ success: false, message: 'name and type are required' })
    }

    const role = req.user.role === 'institution' || req.user.role === 'company' ? req.user.role : null
    if (!role) {
      return res.status(403).json({ success: false, message: 'Access denied' })
    }

    const doc = await addPartnershipDocument({
      partnershipId: req.params.id,
      actor: {
        userId: req.user._id,
        role,
        institution: req.institution,
        company: req.company,
      },
      name,
      type,
      fileUrl,
      fileName,
      expiryDate,
    })

    res.status(201).json({ success: true, document: doc })
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to add document',
    })
  }
}
