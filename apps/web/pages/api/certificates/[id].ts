import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { Certificate, UserRole } from '@luxgen/db';

import { renderCertificateHtml } from '../../../lib/certificate-html';

const STAFF_ROLES = new Set<string>([UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.INSTRUCTOR]);

interface JwtPayload {
  id: string;
  tenant: string;
  role?: string;
}

function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
  } catch {
    return null;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).send('Method not allowed');
  }

  const { id } = req.query;
  if (!id || Array.isArray(id)) {
    return res.status(400).send('Certificate id required');
  }

  const authToken = req.headers.authorization?.replace('Bearer ', '');
  if (!authToken) {
    return res.status(401).send('Authentication required');
  }

  const payload = verifyToken(authToken);
  if (!payload?.id) {
    return res.status(401).send('Invalid token');
  }

  try {
    const certificate = await Certificate.findById(id).populate('tenant');
    if (!certificate) {
      return res.status(404).send('Certificate not found');
    }

    const studentId = certificate.student.toString();
    const isOwner = payload.id === studentId;
    const isStaff = payload.role ? STAFF_ROLES.has(payload.role) : false;

    if (!isOwner && !isStaff) {
      return res.status(403).send('Not authorized');
    }

    if (payload.tenant && payload.tenant !== certificate.tenant.toString()) {
      return res.status(403).send('Tenant mismatch');
    }

    const tenantName =
      certificate.tenant && typeof certificate.tenant === 'object' && 'name' in certificate.tenant
        ? String((certificate.tenant as { name: string }).name)
        : undefined;

    const html = renderCertificateHtml({
      courseTitle: certificate.courseTitle,
      studentName: certificate.studentName,
      certificateNumber: certificate.certificateNumber,
      issuedAt: certificate.issuedAt.toISOString(),
      tenantName,
    });

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(200).send(html);
  } catch (error) {
    console.error('Certificate download error:', error);
    res.status(500).send('Internal server error');
  }
}
